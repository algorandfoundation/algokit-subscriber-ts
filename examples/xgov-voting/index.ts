import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { Prisma, PrismaClient } from '@prisma/client'
import algosdk, { ABIValue } from 'algosdk'
import fs from 'fs'
import path from 'path'
import { AlgorandSubscriber } from '../../src/subscriber'
import { VotingRoundAppClient } from './types/voting-app-client'
import { VoteType, VotingRoundMetadata } from './types/voting-round'
import ABIArrayDynamicType = algosdk.ABIArrayDynamicType
import ABIUintType = algosdk.ABIUintType
import TransactionType = algosdk.TransactionType

if (!fs.existsSync(path.join(__dirname, '..', '..', '.env')) && !process.env.ALGOD_SERVER) {
  // eslint-disable-next-line no-console
  console.error('Copy /.env.sample to /.env before starting the application.')
  process.exit(1)
}

const prisma = new PrismaClient()

const votingRoundId = 1821334702 // Grab from https://voting.algorand.foundation/
const watermarkId = `voting-${votingRoundId}`

async function getXGovSubscriber() {
  const algorand = AlgorandClient.fromEnvironment()

  // Get voting round metadata
  const appClient = algorand.client.getTypedAppClientById(VotingRoundAppClient, {
    id: votingRoundId,
  })
  const votingRoundState = await appClient.getGlobalState()
  const votingRoundMetadata = (await (
    await fetch(`https://ipfs.algonode.xyz/ipfs/${votingRoundState.metadataIpfsCid!.asString()}`)
  ).json()) as VotingRoundMetadata

  const answerIndexMetadata = votingRoundMetadata.questions.flatMap((q) =>
    q.options.map((o, i) => ({
      questionId: q.id,
      optionIndex: i,
      optionId: o.id,
    })),
  )

  const useWeighting = votingRoundMetadata.type === VoteType.WEIGHTING || votingRoundMetadata.type === VoteType.PARTITIONED_WEIGHTING
  const answerAppArgsIndex = useWeighting ? 4 : 3
  const answerArrayType = new ABIArrayDynamicType(new ABIUintType(useWeighting ? 64 : 8))

  // Insert metadata into sqlite (one-shot create since it's idempotent data)
  if (!(await prisma.votingRound.findFirst({ where: { id: votingRoundId.toString() } }))) {
    await prisma.$transaction(async (p) => {
      const result = await p.votingRound.create({
        data: {
          id: votingRoundId.toString(),
          title: votingRoundMetadata.title,
          questions: {
            createMany: {
              data: votingRoundMetadata.questions.map((q) => ({
                id: q.id,
                prompt: q.prompt,
              })),
            },
          },
        },
      })
      const result2 = await p.votingRoundQuestionOption.createMany({
        data: votingRoundMetadata.questions.flatMap((q) =>
          q.options.map((o, i) => ({
            id: o.id,
            questionId: q.id,
            optionIndex: i,
            prompt: o.label,
          })),
        ),
      })
      console.log('Created voting round metadata', result, result2)
    })
  }

  const subscriber = new AlgorandSubscriber(
    {
      filters: [
        {
          name: 'xgov-vote',
          filter: {
            type: TransactionType.appl,
            appId: votingRoundId,
            methodSignature: 'vote(pay,byte[],uint64,uint8[],uint64[],application)void',
          },
        },
      ],
      frequencyInSeconds: 5,
      maxRoundsToSync: 100,
      syncBehaviour: 'catchup-with-indexer',
      watermarkPersistence: {
        get: async () => (await prisma.watermark.findUnique({ where: { id: watermarkId }, select: { watermark: true } }))?.watermark ?? 0,
        set: async (_watermark) => {
          /* Happens in onPoll() */
        },
      },
    },
    algorand.client.algod,
    algorand.client.indexer,
  )
  subscriber.onPoll(async (poll) => {
    const result = await prisma.$transaction(
      async (p) => {
        // Optimistic locking of watermark from current poll
        const expectedStartingWatermark =
          (await p.watermark.findUnique({ where: { id: watermarkId }, select: { watermark: true } }))?.watermark ?? 0
        if (expectedStartingWatermark !== poll.startingWatermark) {
          throw new Error(`Watermark mismatch; expected ${expectedStartingWatermark} but got ${poll.startingWatermark}`)
        }

        const updateWatermark = async () => {
          return await p.watermark.upsert({
            create: {
              id: watermarkId,
              watermark: poll.newWatermark,
              updated: new Date().toISOString(),
            },
            update: {
              watermark: poll.newWatermark,
              updated: new Date().toISOString(),
            },
            where: {
              id: watermarkId,
            },
          })
        }

        if (poll.subscribedTransactions.length === 0) {
          const watermark = await updateWatermark()
          console.log(`No new transactions found in rounds ${poll.syncedRoundRange[0]}-${poll.syncedRoundRange[1]}`, watermark)
          return
        }

        const votes = await p.vote.createMany({
          data: poll.subscribedTransactions.map((t) => ({
            id: t.id,
            voterAddress: t.sender,
            votingRoundId: votingRoundId.toString(),
            castedAt: new Date(t['round-time']! * 1000).toISOString(),
          })),
        })

        const casts = await p.voteCast.createMany({
          data: poll.subscribedTransactions.flatMap((t) => {
            return answerArrayType
              .decode(Buffer.from(t!['application-transaction']!['application-args']![answerAppArgsIndex], 'base64'))
              .map((v: ABIValue, i: number) => {
                if (!useWeighting) {
                  const questionIndex = i
                  const answerIndex = parseInt(v.toString())
                  const questionOptionIndex = answerIndexMetadata.findIndex(
                    (a) => a.questionId === votingRoundMetadata.questions[questionIndex].id && a.optionIndex === answerIndex,
                  )
                  return {
                    id: `${t.id}-${answerIndexMetadata[questionOptionIndex].optionId}`,
                    questionOptionId: answerIndexMetadata[questionOptionIndex].optionId,
                    optionIndex: answerIndexMetadata[questionOptionIndex].optionIndex,
                    voteId: t.id,
                    voteWeight: '1',
                  }
                }
                return {
                  id: `${t.id}-${answerIndexMetadata[i].optionId}`,
                  questionOptionId: answerIndexMetadata[i].optionId,
                  optionIndex: answerIndexMetadata[i].optionIndex,
                  voteId: t.id,
                  voteWeight: v.toString(),
                }
              })
          }),
        })

        const watermark = await updateWatermark()

        console.log(
          `Finished persisting ${poll.subscribedTransactions.length} matched transactions from rounds ${poll.syncedRoundRange[0]}-${poll.syncedRoundRange[1]} to database`,
          'votes',
          votes,
          'casts',
          casts,
          'watermark',
          watermark,
        )
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 30_000,
      },
    )
  })

  // eslint-disable-next-line no-console
  subscriber.on('xgov-vote', (event) => {
    const votes = answerArrayType.decode(Buffer.from(event!['application-transaction']!['application-args']![answerAppArgsIndex], 'base64'))
    // eslint-disable-next-line no-console
    console.log(`${event.sender} voted with txn ${event.id} with votes:`, votes)
  })
  return subscriber
}

// Basic methods that persist using filesystem - for illustrative purposes only

async function saveWatermark(watermark: number) {
  fs.writeFileSync(path.join(__dirname, 'watermark.txt'), watermark.toString(), { encoding: 'utf-8' })
}

async function getLastWatermark(): Promise<number> {
  if (!fs.existsSync(path.join(__dirname, 'watermark.txt'))) return 0
  const existing = fs.readFileSync(path.join(__dirname, 'watermark.txt'), 'utf-8')
  // eslint-disable-next-line no-console
  console.log(`Found existing sync watermark in watermark.txt; syncing from ${existing}`)
  return Number(existing)
}

;(async () => {
  const subscriber = await getXGovSubscriber()

  if (process.env.RUN_LOOP === 'true') {
    subscriber.onError((e) => {
      // eslint-disable-next-line no-console
      console.error(e)
    })
    subscriber.start()
    ;['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) =>
      process.on(signal, () => {
        // eslint-disable-next-line no-console
        console.log(`Received ${signal}; stopping subscriber...`)
        subscriber.stop(signal)
      }),
    )
  } else {
    await subscriber.pollOnce()
  }
  prisma.$disconnect()
})().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
  prisma.$disconnect()
})
