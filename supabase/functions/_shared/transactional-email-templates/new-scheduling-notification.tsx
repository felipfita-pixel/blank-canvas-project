import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Corretores Associados"

interface Props {
  name?: string
  email?: string
  phone?: string
  whatsapp?: string
  message?: string
}

const NewSchedulingNotificationEmail = ({ name, email, phone, whatsapp, message }: Props) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Nova solicitação de agendamento de {name || 'visitante'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📅 Nova Solicitação de Agendamento</Heading>
        <Text style={text}>Um visitante solicitou uma consultoria pelo site.</Text>
        <Section style={infoBox}>
          <Text style={label}>Nome:</Text>
          <Text style={value}>{name || '—'}</Text>
          <Text style={label}>E-mail:</Text>
          <Text style={value}>{email || '—'}</Text>
          <Text style={label}>Telefone:</Text>
          <Text style={value}>{phone || '—'}</Text>
          <Text style={label}>WhatsApp:</Text>
          <Text style={value}>{whatsapp || '—'}</Text>
        </Section>
        {message && (
          <>
            <Hr style={hr} />
            <Text style={label}>Mensagem:</Text>
            <Text style={messageStyle}>{message}</Text>
          </>
        )}
        <Hr style={hr} />
        <Text style={footer}>Este e-mail foi enviado automaticamente por {SITE_NAME}.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewSchedulingNotificationEmail,
  subject: (data: Record<string, any>) => `Nova solicitação de agendamento: ${data.name || 'Visitante'}`,
  to: 'felipfita@gmail.com',
  displayName: 'Notificação de agendamento',
  previewData: { name: 'Carlos Oliveira', email: 'carlos@email.com', phone: '(21) 97777-7777', whatsapp: '(21) 97777-7777', message: 'Quero agendar visita em Botafogo.' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { padding: '30px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: 'hsl(213, 60%, 22%)', margin: '0 0 20px' }
const text = { fontSize: '14px', color: 'hsl(213, 15%, 50%)', lineHeight: '1.6', margin: '0 0 15px' }
const infoBox = { backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '16px 20px', marginBottom: '15px' }
const label = { fontSize: '12px', fontWeight: '600' as const, color: 'hsl(213, 60%, 22%)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '8px 0 2px' }
const value = { fontSize: '14px', color: 'hsl(213, 35%, 15%)', margin: '0 0 8px' }
const messageStyle = { fontSize: '14px', color: 'hsl(213, 35%, 15%)', lineHeight: '1.6', backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '12px 16px', margin: '4px 0 15px' }
const hr = { borderColor: 'hsl(214, 20%, 90%)', margin: '20px 0' }
const footer = { fontSize: '12px', color: 'hsl(213, 15%, 50%)', margin: '20px 0 0' }
