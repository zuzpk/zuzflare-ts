"use client"
import { Box, css, Group, Image, Text } from "@zuzjs/ui";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    document.title = `ZuzJS`
  }, [])

  return <Group as={`h:100vh w:50vw bg:$surface abs abc flex jcc p:150 cols gap:15`}>
      <Image src={`/imgs/zuz-logo.png`} as={`w:50 mb:75`} />
      <Text as={`s:xxl bold`}>To get started, edit the page.tsx file.</Text>
      <Text as={`s:lg`}>Get started by editing <code>src/app/page.tsx</code>.</Text>  
      <Box as={`flex cols`}>
        <Link href={`/u/signin`}
          className={css(`bg:$primary tdn p:$padding-md-x,$padding-lg-y r:$radius-md s:$text-lg bold c:$text-btn flex ass mt:50 &hover(bg:$primary-hover)`)}>Sign in</Link>
      </Box>
  </Group>

}