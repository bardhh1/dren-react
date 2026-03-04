import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { StyleProp, useColorScheme } from "react-native"
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  Theme as NavTheme,
} from "@react-navigation/native"

import { loadString, saveString } from "@/utils/storage"

import { setImperativeTheming } from "./context.utils"
import { darkTheme, lightTheme } from "./theme"
import type {
  AllowedStylesT,
  ImmutableThemeContextModeT,
  Theme,
  ThemeContextModeT,
  ThemedFnT,
  ThemedStyle,
} from "./types"

export type ThemeContextType = {
  navigationTheme: NavTheme
  setThemeContextOverride: (newTheme: ThemeContextModeT) => void
  theme: Theme
  themeContext: ImmutableThemeContextModeT
  themed: ThemedFnT
}

export const ThemeContext = createContext<ThemeContextType | null>(null)

export interface ThemeProviderProps {
  initialContext?: ThemeContextModeT
}

export const ThemeProvider: FC<PropsWithChildren<ThemeProviderProps>> = ({
  children,
  initialContext,
}) => {
  const systemColorScheme = useColorScheme()
  const [themeScheme, setThemeScheme] = useState<ThemeContextModeT>(undefined)

  useEffect(() => {
    setThemeScheme((loadString("ignite.themeScheme") as ThemeContextModeT) || undefined)
  }, [])

  const setThemeContextOverride = useCallback((newTheme: ThemeContextModeT) => {
    setThemeScheme(newTheme)

    if (newTheme) {
      saveString("ignite.themeScheme", newTheme)
    }
  }, [])

  const themeContext: ImmutableThemeContextModeT = useMemo(() => {
    const t = initialContext || themeScheme || (!!systemColorScheme ? systemColorScheme : "light")
    return t === "dark" ? "dark" : "light"
  }, [initialContext, themeScheme, systemColorScheme])

  const navigationTheme: NavTheme = useMemo(() => {
    switch (themeContext) {
      case "dark":
        return NavDarkTheme
      default:
        return NavDefaultTheme
    }
  }, [themeContext])

  const theme: Theme = useMemo(() => {
    switch (themeContext) {
      case "dark":
        return darkTheme
      default:
        return lightTheme
    }
  }, [themeContext])

  useEffect(() => {
    setImperativeTheming(theme)
  }, [theme])

  const themed = useCallback(
    <T,>(styleOrStyleFn: AllowedStylesT<T>) => {
      const flatStyles = [styleOrStyleFn].flat(3) as (ThemedStyle<T> | StyleProp<T>)[]
      const stylesArray = flatStyles.map((f) => {
        if (typeof f === "function") {
          return (f as ThemedStyle<T>)(theme)
        } else {
          return f
        }
      })
      return Object.assign({}, ...stylesArray) as T
    },
    [theme],
  )

  const value = {
    navigationTheme,
    theme,
    themeContext,
    setThemeContextOverride,
    themed,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useAppTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useAppTheme must be used within an ThemeProvider")
  }
  return context
}
