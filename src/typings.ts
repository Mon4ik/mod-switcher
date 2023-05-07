export type ModPackInfo = {
    currentlyUsing: boolean,
    id: string,
    title: string,
    description: string,
    version: string,
    loader: string
}

export type ModMetadata = {
    filename: string
    version: string
    displayName: string
    displayURL?: string
    credits?: string
    authors?: string
    description: string
}