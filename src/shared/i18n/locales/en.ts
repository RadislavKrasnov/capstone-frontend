export const en = {
    auth: {
        appName: 'Tour Package Analyzer',
        loginSubtitle: 'Sign in to your account',
        signupSubtitle: 'Create your agency workspace',

        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot password?',
        login: 'Login',
        signingIn: 'Signing in…',

        noAccount: "Don't have an account?",
        createAccount: 'Create account',
        alreadyHaveAccount: 'Already have an account?',

        internalUseOnly: 'WanderCraft Agency · Internal Use Only',

        agencyInformation: 'Agency information',
        agencyName: 'Agency name',
        agencySlug: 'Agency slug',
        generateFromName: 'Generate from name',
        country: 'Country',
        city: 'City',
        agencyPhone: 'Agency phone',
        website: 'Website',

        ownerAccount: 'Owner account',
        firstName: 'First name',
        lastName: 'Last name',
        username: 'Username',
        ownerPhone: 'Owner phone',

        creatingAccount: 'Creating account…',

        placeholders: {
            email: 'you@company.com',
            ownerEmail: 'owner@example.com',
            password: '••••••••',
            agencyName: 'Travel Pro',
            agencySlug: 'travel-pro',
            country: 'Ukraine',
            city: 'Kharkiv',
            phone: '+380501112233',
            website: 'https://travel-pro.com',
            firstName: 'John',
            lastName: 'Smith',
            username: 'owner',
        },

        errors: {
            loginFailed: 'Unable to sign in. Please check your email and password.',
            signupFailed: 'Unable to create account. Please check the form and try again.',

            emailRequired: 'Email is required',
            emailInvalid: 'Enter a valid email address',
            emailTooLong: 'Email is too long',

            passwordRequired: 'Password is required',
            passwordTooShort: 'Password must contain at least 6 characters',
            passwordTooLong: 'Password is too long',

            agencyNameRequired: 'Agency name is required',
            agencyNameTooLong: 'Agency name is too long',

            agencySlugTooShort: 'Slug must contain at least 3 characters',
            agencySlugTooLong: 'Slug is too long',
            agencySlugInvalid: 'Use lowercase letters, numbers, and hyphens only',

            websiteInvalid: 'Enter a valid website URL, for example https://travel-pro.com',

            usernameTooShort: 'Username must contain at least 3 characters',
            usernameTooLong: 'Username is too long',
            usernameInvalid: 'Use letters, numbers, dots, underscores, or hyphens only',

            firstNameRequired: 'First name is required',
            firstNameTooLong: 'First name is too long',

            lastNameRequired: 'Last name is required',
            lastNameTooLong: 'Last name is too long',
        },
    },

    common: {
        hidePassword: 'Hide password',
        showPassword: 'Show password',
        notFound: '404 Not Found',
        pageComingSoon: 'This page will be implemented in the next frontend step.',
    },

    pages: {
        packages: 'Tour Packages',
    },
} as const;
