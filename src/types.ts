import { FlareAuthUser } from "@zuzjs/flare";

export enum Events {
    someThing = "something",
    onSomeThing = "onSomeThing",
}
type UserBase = {
    loading: boolean;
    uid?: string | null;
    picture?: string;
    color?: string;
    emailVerified?: boolean;
    provider?: string;
    ticket?: string;
    joined?: string;
}
export type User = UserBase & {
    id: string | null;
    name?: string;
    email?: string;
}

export type AuthUser = User

export enum UserType {
    Guest = 0,
    User = 1,
    Admin = 2
}

export enum UserStatus {
    InActive = 0,
    Active = 1,
    Banned = -1,
}

export type CurrentUserState = {
    user: FlareAuthUser | null;
    isLoading: boolean;
}

export type SyncUserStoreOptions = {
    includeName?: boolean;
    clearOnSignOut?: boolean;
}