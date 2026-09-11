
export interface Customer {
    firstName: string
    lastName: string
    postalCode: string
}

export const customers = {

    standard: {
        firstName: 'Miray',
        lastName: 'Ylmz',
        postalCode: '12345'
    },

    //specialChars: { firstName: 'Mïrây', lastName: "O'Connor", postalCode: 'A1B 2C3' },
    //longValues: { firstName: 'A'.repeat(50), lastName: 'B'.repeat(50), postalCode: '99999' },

}