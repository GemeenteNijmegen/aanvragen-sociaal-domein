import { z } from 'zod';


// Tighten later on
export const SqsSubmissionBodySchema = z.looseObject({
  enrichedObject: z.looseObject({
    pdf: z.string().optional(),
    attachments: z.array(z.unknown()),
    reference: z.string(),
    objectUrl: z.string(),
    objectUUID: z.string(), // later: .uuid()
    sociaalDomeinRegeling: z.string().optional(),
    zaaktypeIdentificatie: z.string().optional(),
    datumAanvraag: z.string().optional(), // later: regex YYYY-MM-DD
    bsn: z.string(), // later: regex 9 digits
    formName: z.string(),
  }),
  filePaths: z.array(z.string()),
  fileObjects: z.array(
    z.looseObject({
      bucket: z.string(),
      objectKey: z.string(),
      fileName: z.string(), // submission or attachment added later on
    }),
  ),
});

export type SqsSubmissionBody = z.infer<typeof SqsSubmissionBodySchema>;