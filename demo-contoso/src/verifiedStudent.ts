/** Represents a Verified Student Credential */
export interface IVerfiedStudent {
    '@context': string | undefined;
    '@type': string | undefined;
    affiliation: string; // contoso university
    email: string; // alice@contoso.edu
    familyName: string; // smith
    givenName: string; // alice
    identifier: string; // alice
    did: string; // did:ion:alice
}

/** 
 * Forms a VerifiedStudent from a student DID, assuming the student is Alice
 */
export function formVerifiedStudent(studentDid: string): IVerfiedStudent {
    return {
        '@context': 'https://identiverse-university.azurewebsites.net/credential/v1',
        '@type': 'VerifiedStudent',
        affiliation: 'Contoso University',
        email: 'alice@contoso.edu',
        familyName: 'Smith',
        givenName: 'Alice',
        identifier: 'alice',
        did: studentDid
    }
}