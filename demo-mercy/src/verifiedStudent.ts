/** Represents a Verified Student Credential */
export interface IVerfiedClient {
    '@context': string | undefined;
    '@type': string | undefined;
    affiliation: string; // contoso case worker
    email: string; // alice@contoso.org
    familyName: string; // smith
    givenName: string; // alice
    identifier: string; // alice
    did: string; // did:ion:alice
}

/** 
 * Forms a VerifiedStudent from a student DID, assuming the student is Alice
 */
export function formVerifiedStudent(studentDid: string): IVerfiedClient {
    return {
        '@context': 'https://identiverse-university.azurewebsites.net/credential/v1',
        '@type': 'VerifiedClient',
        affiliation: 'Contoso Case Worker',
        email: 'alice@contoso.org',
        familyName: 'Smith',
        givenName: 'Alice',
        identifier: 'alice',
        did: studentDid
    }
}