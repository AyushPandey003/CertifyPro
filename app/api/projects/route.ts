import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/db"
import { Projects } from "@/app/db/schema"
import { eq } from "drizzle-orm"
import { auth0 } from "@/lib/auth0"

export async function GET() {
  try {
    const session = await auth0.getSession()
    if (!session?.user?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projects = await db
      .select()
      .from(Projects)
      .where(eq(Projects.userId, session.user.sub))

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession()
    if (!session?.user?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, editorData } = body

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 })
    }

    const newProject = await db
      .insert(Projects)
      .values({
        name,
        type,
        userId: session.user.sub,
        editorData: editorData ? JSON.stringify(editorData) : null,
        status: "draft",
        recipients: 0,
      })
      .returning()

    return NextResponse.json(newProject[0])
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
