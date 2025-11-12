import { PrisonUser } from '../../interfaces/prisonUser'
import { CachedDietaryRequirements } from '../../interfaces/CachedDietaryRequirements'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    dietaryRequirements: CachedDietaryRequirements
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      middleware?: Record
      logout(done: (err: unknown) => void): void
      flash(type: string, message: unknown): number
    }

    interface Locals {
      user: PrisonUser
    }
  }
}
