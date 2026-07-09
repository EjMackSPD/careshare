"use client"

import { useEffect, useRef, useState } from "react"
import type { ComponentPropsWithoutRef, ElementType, Ref } from "react"
import styles from "./Reveal.module.css"

type RevealOwnProps<T extends ElementType> = {
  as?: T
  delay?: number
  direction?: "up" | "left" | "right"
}

type RevealProps<T extends ElementType> = RevealOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof RevealOwnProps<T>>

export default function Reveal<T extends ElementType = "div">({
  as,
  delay = 0,
  direction = "up",
  className,
  children,
  style,
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const directionClass =
    direction === "left"
      ? styles.fromLeft
      : direction === "right"
        ? styles.fromRight
        : styles.fromBottom

  return (
    <Tag
      ref={ref as Ref<Element>}
      className={[styles.reveal, directionClass, visible ? styles.visible : "", className]
        .filter(Boolean)
        .join(" ")}
      style={{ ...style, transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
