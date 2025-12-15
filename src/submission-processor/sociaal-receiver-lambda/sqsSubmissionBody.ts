import { z } from 'zod';


// looseObject vervangen later
export const SqsSubmissionBodySchema = z.looseObject({
  enrichedObject: z.looseObject({
    pdf: z.string().optional(),
    attachments: z.array(z.unknown()),
    reference: z.string(),
    objectUrl: z.string(),
    objectUUID: z.string(), // later: .uuid()
    sociaalDomeinRegeling: z.string().optional(),
    zaaktypeIdentificatie: z.string().optional(),
    datumAanvraag: z.string().optional(),
    bsn: z.string().optional(),
    kvk: z.string().optional(),
    bsnNamens: z.string().optional(),
    kvkNamens: z.string().optional(),
    formName: z.string(),
    inlogmiddel: z.string().optional(),
    networkShare: z.string().optional(),
    monitoringNetworkShare: z.string().optional().nullable(),
    internalNotificationEmails: z.array(z.string()).optional().nullable(),
    bsnOrKvkToFile: z.boolean().optional().nullable(),
  }),
  filePaths: z.array(z.string()),
  fileObjects: z.array(
    z.looseObject({
      bucket: z.string(),
      objectKey: z.string(),
      fileName: z.string(),
      objectType: z.string().optional(),
    }),
  ),
});

export type SqsSubmissionBody = z.infer<typeof SqsSubmissionBodySchema>;