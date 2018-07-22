import { Messages_server_channel_messages } from '@queries/__generated__/Messages'
import memoize from 'memoizee'

/**
 * Compares whether a message should go in a group
 */
function compare(
  a: Messages_server_channel_messages,
  b: Messages_server_channel_messages
) {
  return (
    a.__typename === 'JoinMessage' ||
    // If the ID is not equal to the previous message
    a.author.id !== b.author.id ||
    // If the name is not equal to the previous message
    a.author.name !== b.author.name ||
    // If the interval between the previous message is greater than 5 mins
    b.timestamp - a.timestamp > 5 * 60 * 1000
  )
}

/**
 * Groups messages into an array
 * @example
 * [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 1 }]
 * // Output
 * [[{ id: 1 }], [{ id: 2 }], [{ id: 1 }, { id: 1 }]]
 * @param messages The messages to group
 */
const Group = <Group extends Messages_server_channel_messages[]>(
  messages: Group
): Group[] => {
  const result = new Array<Group>()
  let group = null
  let previous: Messages_server_channel_messages

  messages.forEach((message, i) => {
    if (group === null || compare(previous, message)) {
      group = result.push([] as Group) - 1
    }
    result[group].push(message)
    previous = message
  })

  return result
}

export default memoize(Group, {
  normalizer: ([messages]) => JSON.stringify(messages)
})
