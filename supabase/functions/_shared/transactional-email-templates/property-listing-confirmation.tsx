import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Corretores Associados & FF"

interface Props {
  name?: string
}

const PropertyListingConfirmationEmail = ({ name }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Recebemos seu imóvel para avaliação — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `Olá, ${name}!` : 'Olá!'}
        </Heading>
        <Text style={text}>
          Recebemos os dados do seu imóvel com sucesso! Nossa equipe de especialistas
          irá avaliar as informações e entrar em contato em breve para dar continuidade
          ao processo de divulgação.
        </Text>
        <Text style={text}>
          Fique tranquilo — seu imóvel será divulgado nos principais portais imobiliários
          e redes sociais de forma totalmente gratuita.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Atenciosamente, equipe {SITE_NAME}.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PropertyListingConfirmationEmail,
  subject: 'Recebemos seu imóvel! — Corretores Associados & FF',
  displayName: 'Confirmação de anúncio de imóvel',
  previewData: { name: 'Maria Silva' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '30px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: 'hsl(213, 60%, 22%)', margin: '0 0 20px' }
const text = { fontSize: '14px', color: 'hsl(213, 15%, 50%)', lineHeight: '1.6', margin: '0 0 15px' }
const hr = { borderColor: 'hsl(214, 20%, 90%)', margin: '20px 0' }
const footer = { fontSize: '12px', color: 'hsl(213, 15%, 50%)', margin: '20px 0 0' }
