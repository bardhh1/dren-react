/**
 * This file does the setup for integration with Reactotron, which is a
 * free desktop app for inspecting and debugging your React Native app.
 * @see https://github.com/infinitered/reactotron
 */
import { Platform, NativeModules } from "react-native"
import { router } from "expo-router"
import { ArgType } from "reactotron-core-client"

import { Reactotron } from "./ReactotronClient"

const reactotron = Reactotron.configure({
  name: require("../../package.json").name,
  onConnect: () => {
    Reactotron.clear()
  },
})

if (Platform.OS !== "web") {
  reactotron.useReactNative({
    networking: {
      ignoreUrls: /symbolicate/,
    },
  })
}

reactotron.onCustomCommand({
  title: "Show Dev Menu",
  description: "Opens the React Native dev menu",
  command: "showDevMenu",
  handler: () => {
    Reactotron.log("Showing React Native dev menu")
    NativeModules.DevMenu.show()
  },
})

reactotron.onCustomCommand<[{ name: "route"; type: ArgType.String }]>({
  command: "navigateTo",
  handler: (args) => {
    const { route } = args ?? {}
    if (route) {
      Reactotron.log(`Navigating to: ${route}`)
      // @ts-ignore
      router.push(route)
    } else {
      Reactotron.log("Could not navigate. No route provided.")
    }
  },
  title: "Navigate To Screen",
  description: "Navigates to a screen by name.",
  args: [{ name: "route", type: ArgType.String }],
})

reactotron.onCustomCommand({
  title: "Go Back",
  description: "Goes back",
  command: "goBack",
  handler: () => {
    Reactotron.log("Going back")
    router.back()
  },
})

console.tron = reactotron

declare global {
  interface Console {
    tron: typeof reactotron
  }
}

reactotron.connect()
