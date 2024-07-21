import { faker } from '@faker-js/faker'
import _ from 'lodash'
import { db } from '~/server/db'

for (let i = 0; i < 5; i++) {
  await db.tag.create({
    data: {
      color: faker.color.rgb(),
      tag: faker.word.noun(),
    },
  })
}
for (let i = 0; i < 5; i++) {
  await db.list.create({
    data: {
      color: faker.color.rgb(),
      list: faker.word.noun(),
    },
  })
}

for (let i = 0; i < 40; i++) {
  const priorities = ['low', 'medium', 'high', 'urgent']
  const tags = await db.tag.findMany()
  const lists = await db.list.findMany()

  await db.task.create({
    data: {
      completed: faker.datatype.boolean({ probability: 0.3 }),
      dueDate: faker.date.anytime(),
      // @ts-expect-error ignore
      priority: priorities[faker.datatype.number({ min: 0, max: 4 })] ?? 'low',
      task: faker.word.noun(),
      description: faker.word.words({ count: 5 }),
      tags: {
        connect: _.shuffle(tags?.map((tag) => ({ id: tag.id }))),
      },
      list: {
        connect: {
          id: lists[faker.datatype.number({ min: 0, max: 4 })]?.id,
        },
      },
    },
  })
}
