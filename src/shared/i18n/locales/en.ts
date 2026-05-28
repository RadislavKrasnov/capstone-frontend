export const en = {
    auth: {
        appName: 'Tour Package Analyzer',
        shortAppName: 'Tour Analyzer',
        loginSubtitle: 'Sign in to your account',
        signupSubtitle: 'Create your agency workspace',

        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot password?',
        login: 'Login',
        signingIn: 'Signing in…',
        logout: 'Logout',
        loggingOut: 'Logging out…',

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

        initializing: 'Loading application…',

        roles: {
            OWNER: 'Owner',
            MANAGER: 'Manager',
        },

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

    navigation: {
        label: 'Navigation',
        packages: 'Packages',
        agencyUsers: 'Agency users',
    },

    common: {
        hidePassword: 'Hide password',
        showPassword: 'Show password',
        notFound: '404 Not Found',
        pageComingSoon: 'This page will be implemented in the next frontend step.',
        notifications: 'Notifications',
        agencyNumber: 'Agency #{{agencyId}}',
    },

    pages: {
        packages: 'Tour Packages',
        suppliers: 'Suppliers',
        analysisSettings: 'Analysis Settings',
        agencyUsers: 'Agency Users',
        agencyUsersSubtitle: 'Manage team access and roles',
    },

    users: {
        title: 'Users',
        summary: '{{total}} users · {{active}} active · {{inactive}} inactive',
        searchPlaceholder: 'Search users...',
        newUser: 'New User',
        editUserTitle: 'Edit User — {{name}}',
        deleteUserTitle: 'Delete User',

        loading: 'Loading users...',
        unableToLoadTitle: 'Unable to load users',
        unableToLoadDescription: 'Please check backend availability and try again.',
        retry: 'Retry',
        noSearchResults: 'No users match your search.',
        tableFooter: '{{visible}} of {{total}} users',
        refreshing: 'Refreshing...',

        table: {
            name: 'Name',
            email: 'Email',
            role: 'Role',
            agency: 'Agency',
            active: 'Active',
            actions: '',
        },

        status: {
            yes: 'Yes',
            no: 'No',
            activeUser: 'Active user',
        },

        actions: {
            edit: 'Edit',
            delete: 'Delete',
            cancel: 'Cancel',
            saveUser: 'Save User',
            saving: 'Saving...',
            deleting: 'Deleting...',
        },

        fields: {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email',
            username: 'Username',
            role: 'Role',
            password: 'Password',
        },

        placeholders: {
            firstName: 'John',
            lastName: 'Manager',
            email: 'manager@example.com',
            username: 'manager1',
            password: 'Password123',
        },

        hints: {
            keepCurrentPassword: 'Leave empty to keep current password.',
        },

        deleteConfirmationPrefix: 'Are you sure you want to delete',
        deleteConfirmationSuffix: '? This action cannot be undone.',

        errors: {
            fallback: 'Something went wrong. Please try again.',
            passwordRequiredForNewUser: 'Password is required for a new user.',
            firstNameRequired: 'First name is required',
            lastNameRequired: 'Last name is required',
            emailInvalid: 'Enter a valid email',
            usernameTooShort: 'Username is too short',
            passwordTooShort: 'Password must contain at least 6 characters',
        },
    },
} as const;
