/** Represents a Verified Student Credential */
export interface IBookStoreDiscount {
    '@context': string | undefined;
    '@type': string | undefined;
    customer: string; // Alice Smith
    discount: string; // 0.1
    discountCode: string; // ContosoUniversity
    isGift: boolean; // false
    seller: string; // Fabrikam Bookstore
    did: string; // did:ion:alice
}

/** 
 * Forms a BookStoreDiscount from a student DID, assuming the student is Alice
 */
export function formBookStoreDiscount(studentDid: string): IBookStoreDiscount {
    return {
        '@context': 'https://identiverse-university.azurewebsites.net/credential/v1',
        '@type': 'BookStoreDiscount',
        customer: 'Alice Smith',
        discount: '20% off',
        discountCode: 'ContosoUniversity',
        isGift: false,
        seller: 'Fabrikam Bookstore',
        did: studentDid
    }
}