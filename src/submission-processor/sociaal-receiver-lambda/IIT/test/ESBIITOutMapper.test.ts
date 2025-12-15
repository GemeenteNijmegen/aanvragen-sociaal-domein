import { Logger } from '@aws-lambda-powertools/logger';
import { mapIITToEsbOut } from '../EsbIITOutMapper';
import { fixtureAanvraagSociaalDomeinBsn, fixtureAanvraagSociaalDomeinKvk, fixtureESBIITOutBsn, fixtureESBIITOutKvk } from './FixturesESBIITOutMapper';

describe('ESB IIT Out Mapper', () => {
  it('should map basic aanvraag sociaal domein with bsn', () => {
    const result = mapIITToEsbOut(fixtureAanvraagSociaalDomeinBsn, new Logger());
    expect(result).toMatchObject(fixtureESBIITOutBsn);
  });
  it('should map basic aanvraag sociaal domein with kvk', () => {
    const result = mapIITToEsbOut(fixtureAanvraagSociaalDomeinKvk, new Logger());
    expect(result).toMatchObject(fixtureESBIITOutKvk);
  });
});