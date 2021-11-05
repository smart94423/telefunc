import { getTodoItems } from './index.telefunc'

export { onBeforeRender }

async function onBeforeRender() {
  const todoItemsInitial = await getTodoItems()
  const pageProps = { todoItemsInitial }
  return {
    pageContext: {
      pageProps,
    },
  }
}
