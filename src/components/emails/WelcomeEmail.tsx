import { Html, Head, Preview, Body, Container, Section, Text, Heading, Button, Tailwind } from '@react-email/components'
import * as React from 'react'

export function WelcomeEmail({ userName = 'Bestie' }: { userName?: string }) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Huddle! Let's get your money right.</Preview>
      <Tailwind>
        <Body className="bg-[#0D0D11] text-[#E2E8F0] font-sans my-auto mx-auto p-4">
          <Container className="border border-solid border-[#1A1A23] rounded-2xl my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Heading className="text-[#B8FF3C] text-[32px] font-bold text-center p-0 my-[30px] mx-0">
                Welcome to Huddle!
              </Heading>
              <Text className="text-[16px] leading-[26px]">
                Hey {userName},
              </Text>
              <Text className="text-[16px] leading-[26px]">
                No cap, we're so hyped to have you here! Huddle is your new AI money coach designed to help you save more, spend smarter, and roast your bad money habits (if you're into that vibe).
              </Text>
              <Text className="text-[16px] leading-[26px]">
                Ready to scan your first receipt and build your saving streak?
              </Text>
              <Section className="text-center mt-[32px] mb-[32px]">
                <Button 
                  className="bg-[#B8FF3C] text-black font-bold rounded-xl px-6 py-4 text-center block w-full"
                  href="https://huddle-app.example.com/dashboard"
                >
                  Go to Dashboard
                </Button>
              </Section>
              <Text className="text-[#888891] text-[14px] leading-[24px]">
                Stay wealthy,<br />
                The Huddle Team
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
