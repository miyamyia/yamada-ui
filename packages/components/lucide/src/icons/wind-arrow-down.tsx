import type { LucideIconProps } from "../lucide-icon"
import { forwardRef } from "@yamada-ui/core"
import { WindArrowDown as WindArrowDownIcon } from "lucide-react"
import { LucideIcon } from "../lucide-icon"

/**
 * `WindArrowDown` is [Lucide](https://lucide.dev) SVG icon component.
 *
 * @see Docs https://yamada-ui.com/components/media-and-icons/lucide
 */
export const WindArrowDown = forwardRef<LucideIconProps, "svg">(
  (props, ref) => <LucideIcon ref={ref} as={WindArrowDownIcon} {...props} />,
)
