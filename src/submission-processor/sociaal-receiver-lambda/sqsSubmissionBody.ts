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
    bsn: z.string(),
    formName: z.string(),
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