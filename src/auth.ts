import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import bcrypt from "bcryptjs"
import { MongoClient as MongoClientClass } from "mongodb"

let _client: MongoClientClass | undefined

function getClient() {
  if (!_client) {
    _client = new MongoClientClass(process.env.DATABASE_URL!)
  }
  return _client
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(getClient()),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const dbClient = await getClient().connect()
        const db = dbClient.db()
        const user = await db
          .collection("users")
          .findOne({ email })

        if (!user) {
          throw new Error("Invalid email or password")
        }

        if (!user.password) {
          throw new Error(
            "This account was created with Google. Please sign in with Google."
          )
        }

        const isValid = await bcrypt.compare(password, user.password as string)
        if (!isValid) {
          throw new Error("Invalid email or password")
        }

        return {
          id: user._id.toString(),
          name: user.name as string | null,
          email: user.email as string,
          image: user.image as string | null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string
      }
      return session
    },
  },
})
