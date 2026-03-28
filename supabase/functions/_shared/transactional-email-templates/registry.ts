/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as newContactNotification } from './new-contact-notification.tsx'
import { template as newChatNotification } from './new-chat-notification.tsx'
import { template as newSchedulingNotification } from './new-scheduling-notification.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'new-contact-notification': newContactNotification,
  'new-chat-notification': newChatNotification,
  'new-scheduling-notification': newSchedulingNotification,
}
