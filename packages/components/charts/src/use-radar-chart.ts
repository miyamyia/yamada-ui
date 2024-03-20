import { useTheme } from "@yamada-ui/core"
import type { CSSUIObject, CSSUIProps } from "@yamada-ui/core"
import { cx, type Dict } from "@yamada-ui/utils"
import type { ComponentPropsWithoutRef } from "react"
import { useCallback, useMemo, useState } from "react"
import type * as Recharts from "recharts"
import { getComponentProps } from "./chart-utils"
import type {
  ChartPropGetter,
  PolarAngleAxisProps,
  PolarGridProps,
  PolarRadiusAxisProps,
  RadarChartProps,
  RadarProps,
  RequiredChartPropGetter,
} from "./chart.types"
import {
  dotProperties,
  polarAngleAxisProperties,
  polarGridProperties,
  polarRadiusAxisProperties,
  radarChartProperties,
  radarProperties,
} from "./rechart-properties"

export type UseRadarChartOptions = {
  /**
   * Chart data.
   */
  data: Dict[]
  /**
   * An array of objects with `dataKey` and `color` keys. Determines which data should be consumed from the `data` array.
   */
  series: RadarProps[]
  /**
   * The key of a group of data which should be unique in an chart.
   */
  dataKey: string
  /**
   * Props for the radar.
   */
  radarProps?: Partial<RadarProps>
  /**
   * Props passed down to recharts `RadarChart` component.
   */
  radarChartProps?: RadarChartProps
  /**
   * Props passed down to recharts `PolarGrid` component.
   */
  polarGridProps?: PolarGridProps
  /**
   * Props passed down to recharts `PolarAngleAxis` component.
   */
  polarAngleAxisProps?: PolarAngleAxisProps
  /**
   * Props passed down to recharts `PolarRadiusAxis` component.
   */
  polarRadiusAxisProps?: PolarRadiusAxisProps
  /**
   * Determines whether dots should be displayed.
   *
   * @default false
   */
  withDots?: boolean
  /**
   * Determines whether activeDots should be displayed.
   *
   * @default true
   */
  withActiveDots?: boolean
  /**
   * Stroke width for the chart radars.
   *
   * @default 2
   */
  strokeWidth?: number
  /**
   * Controls fill opacity of all radars.
   *
   * @default 1
   */
  fillOpacity?: number | [number, number]
  /**
   * A function to format values on Y axis and inside the tooltip.
   */
  valueFormatter?: (value: number) => string
}

type UseRadarChartProps = UseRadarChartOptions & {
  styles: Dict<CSSUIObject>
}

export const useRadarChart = ({
  data,
  series,
  dataKey,
  withDots = false,
  withActiveDots = false,
  strokeWidth = 2,
  fillOpacity = 0.4,
  valueFormatter,
  styles,
  ...rest
}: UseRadarChartProps) => {
  const { theme } = useTheme()
  const [highlightedArea, setHighlightedArea] = useState<string | null>(null)
  const shouldHighlight = highlightedArea !== null
  const {
    dot = {},
    activeDot = {},
    dimDot,
    dimRadar,
    ...computedRadarProps
  } = rest.radarProps ?? {}
  const resolvedPolarGrid = useMemo(
    () => ({ ...rest.polarGridProps, ...styles.polarGrid }),
    [rest.polarGridProps, styles.polarGrid],
  )
  const resolvedPolarRadiusAxis = useMemo(
    () => ({ ...rest.polarRadiusAxisProps, ...styles.polarRadiusAxis }),
    [rest.polarRadiusAxisProps, styles.polarRadiusAxis],
  )

  const radarColors: CSSUIProps["var"] = useMemo(
    () =>
      series.map(({ color }, index) => ({
        __prefix: "ui",
        name: `radar-${index}`,
        token: "colors",
        value: color ?? "transparent",
      })),
    [series],
  )

  // TODO: replace `className`
  const radarVars: CSSUIProps["var"] = useMemo(
    () =>
      [
        ...radarColors,
        { __prefix: "ui", name: "fill-opacity", value: fillOpacity },
        {
          __prefix: "ui",
          name: "grid-stroke",
          token: "colors",
          value: resolvedPolarGrid.stroke,
        },
        {
          __prefix: "ui",
          name: "polar-radius-axis-stroke",
          token: "colors",
          value: resolvedPolarRadiusAxis.stroke,
        },
      ] as Required<CSSUIProps>["var"],
    [
      fillOpacity,
      radarColors,
      resolvedPolarGrid.stroke,
      resolvedPolarRadiusAxis.stroke,
    ],
  )

  const [radarChartProps, radarChartClassName] = useMemo(
    () =>
      getComponentProps<Dict, string>(
        [rest.radarChartProps ?? {}, radarChartProperties],
        styles.chart,
      )(theme),
    [rest.radarChartProps, styles.chart, theme],
  )

  const [polarGridProps, polarGridClassName] = useMemo(
    () =>
      getComponentProps<Dict, string>(
        [rest.polarGridProps ?? {}, polarGridProperties],
        styles.polarGrid,
      )(theme),
    [rest.polarGridProps, styles.polarGrid, theme],
  )

  const [polarAngleAxisProps, polarAngleAxisClassName] = useMemo(
    () =>
      getComponentProps<Dict, string>(
        [rest.polarAngleAxisProps ?? {}, polarAngleAxisProperties],
        styles.polarAngleAxis,
      )(theme),
    [rest.polarAngleAxisProps, styles.polarAngleAxis, theme],
  )

  const [polarRadiusAxisProps, polarRadiusAxisClassName] = useMemo(
    () =>
      getComponentProps<Dict, string>(
        [rest.polarRadiusAxisProps ?? {}, polarRadiusAxisProperties],
        styles.polarRadiusAxis,
      )(theme),
    [rest.polarRadiusAxisProps, styles.polarRadiusAxis, theme],
  )

  const [radarProps, radarClassName] = useMemo(() => {
    const resolvedRadarProps = {
      fillOpacity: "var(--ui-fill-opacity)",
      ...computedRadarProps,
    }

    return getComponentProps<Dict, string>(
      [resolvedRadarProps, radarProperties],
      styles.radar,
    )(theme)
  }, [computedRadarProps, styles.radar, theme])

  const [dimRadarProps, dimRadarClassName] = useMemo(() => {
    const resolvedDimRadar = {
      fillOpacity: 0,
      strokeOpacity: 0.3,
      ...dimRadar,
    }

    return getComponentProps<Dict, string>([resolvedDimRadar, radarProperties])(
      theme,
    )
  }, [dimRadar, theme])

  const [dotProps, dotClassName] = useMemo(() => {
    const resolvedDot = { fillOpacity: 1, strokeOpacity: 1, ...dot }

    return getComponentProps<Dict, string>(
      [resolvedDot, dotProperties],
      styles.dot,
    )(theme)
  }, [dot, styles.dot, theme])

  const [activeDotProps, activeDotClassName] = useMemo(
    () =>
      getComponentProps<Dict, string>(
        [activeDot, dotProperties],
        styles.activeDot,
      )(theme),
    [activeDot, styles.activeDot, theme],
  )

  const [dimDotProps, dimDotClassName] = useMemo(() => {
    const resolvedDimDot = { fillOpacity: 0, strokeOpacity: 0, ...dimDot }
    return getComponentProps<Dict, string>([resolvedDimDot, dotProperties])(
      theme,
    )
  }, [dimDot, theme])

  const radarPropList = useMemo(
    () =>
      series.map((props, index) => {
        const {
          dataKey,
          dot = {},
          activeDot = {},
          dimDot = {},
          dimRadar = {},
          ...computedProps
        } = props
        const color = `var(--ui-radar-${index})`
        const dimmed = shouldHighlight && highlightedArea !== dataKey
        const computedDimRadar = { ...dimRadarProps, ...dimRadar }

        const resolvedProps = {
          ...radarProps,
          ...computedProps,
          ...(dimmed ? computedDimRadar : {}),
        }
        const rest = getComponentProps<Dict, string>(
          [resolvedProps, radarProperties],
          radarClassName,
          dimmed ? dimRadarClassName : undefined,
        )(theme, true)

        let resolvedActiveDot: Recharts.DotProps | boolean

        if (withActiveDots) {
          const computedActiveDot = {
            ...activeDotProps,
            ...activeDot,
          }

          const [rest, className] = getComponentProps<Dict, string>(
            [computedActiveDot, dotProperties],
            activeDotClassName,
          )(theme)

          resolvedActiveDot = {
            className: cx("ui-radar-chart__active-dot", className),
            fill: color,
            stroke: color,
            r: 4,
            ...rest,
          } as Recharts.DotProps
        } else {
          resolvedActiveDot = false
        }

        let resolvedDot: Recharts.DotProps | boolean

        if (withDots) {
          const computedDimDot = { ...dimDotProps, ...dimDot }
          const computedDot = {
            ...dotProps,
            ...dot,
            ...(dimmed ? computedDimDot : {}),
          }

          const [rest, className] = getComponentProps(
            [computedDot, dotProperties],
            dotClassName,
            dimmed ? dimDotClassName : undefined,
          )(theme)

          resolvedDot = {
            className: cx("ui-radar-chart__dot", className),
            fill: color,
            ...rest,
          } as Recharts.DotProps
        } else {
          resolvedDot = false
        }

        return {
          ...rest,
          color,
          dataKey,
          dot: resolvedDot,
          activeDot: resolvedActiveDot,
        }
      }),
    [
      activeDotClassName,
      activeDotProps,
      dimDotClassName,
      dimDotProps,
      dimRadarClassName,
      dimRadarProps,
      dotClassName,
      dotProps,
      highlightedArea,
      radarClassName,
      radarProps,
      series,
      shouldHighlight,
      theme,
      withActiveDots,
      withDots,
    ],
  )

  const getRadarChartProps: ChartPropGetter<
    "div",
    ComponentPropsWithoutRef<typeof Recharts.RadarChart>,
    ComponentPropsWithoutRef<typeof Recharts.RadarChart>
  > = useCallback(
    ({ className, ...props } = {}, ref = null) => ({
      ref,
      className: cx(className, radarChartClassName),
      data,
      ...props,
      ...radarChartProps,
    }),
    [data, radarChartClassName, radarChartProps],
  )

  const getRadarProps: RequiredChartPropGetter<
    "div",
    { index: number },
    Omit<Recharts.RadarProps, "ref">
  > = useCallback(
    ({ index, className: classNameProp, ...props }, ref = null) => {
      const { color, className, dataKey, activeDot, dot, ...rest } =
        radarPropList[index]

      return {
        ref,
        className: cx(classNameProp, className),
        activeDot,
        dot,
        name: dataKey as string,
        dataKey,
        fill: color,
        strokeWidth,
        stroke: color,
        isAnimationActive: false,
        ...(props as Omit<Recharts.RadarProps, "dataKey">),
        ...rest,
      }
    },
    [radarPropList, strokeWidth],
  )

  const getPolarGridProps: ChartPropGetter<
    "div",
    Recharts.PolarGridProps,
    Recharts.PolarGridProps
  > = useCallback(
    ({ className, ...props } = {}, ref = null) => ({
      ref,
      className: cx(className, polarGridClassName),
      stroke: "var(--ui-grid-stroke)",
      ...props,
      ...polarGridProps,
    }),
    [polarGridClassName, polarGridProps],
  )

  const getPolarAngleAxisProps: ChartPropGetter<
    "div",
    Recharts.PolarAngleAxisProps,
    Omit<Recharts.PolarAngleAxisProps, "ref">
  > = useCallback(
    ({ className, ...props } = {}, ref = null) => ({
      ref,
      className: cx(className, polarAngleAxisClassName),
      dataKey,
      tickFormatter: valueFormatter,
      ...props,
      ...polarAngleAxisProps,
    }),
    [dataKey, polarAngleAxisClassName, polarAngleAxisProps, valueFormatter],
  )

  const getPolarRadiusAxisProps: ChartPropGetter<
    "div",
    Recharts.PolarRadiusAxisProps,
    Omit<Recharts.PolarRadiusAxisProps, "ref">
  > = useCallback(
    ({ className, ...props } = {}, ref = null) => ({
      ref,
      className: cx(className, polarRadiusAxisClassName),
      stroke: "var(--ui-polar-radius-axis-stroke)",
      tickFormatter: valueFormatter,
      ...props,
      ...polarRadiusAxisProps,
    }),
    [polarRadiusAxisClassName, polarRadiusAxisProps, valueFormatter],
  )

  return {
    radarVars,
    getRadarChartProps,
    getRadarProps,
    getPolarGridProps,
    getPolarAngleAxisProps,
    getPolarRadiusAxisProps,
    setHighlightedArea,
  }
}

export type UseRadarChartReturn = ReturnType<typeof useRadarChart>
