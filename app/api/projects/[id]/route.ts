import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/db"
import { Projects } from "@/app/db/schema"
import { eq, and } from "drizzle-orm"
import { auth0 } from "@/lib/auth0"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth0.getSession();
    if (!session?.user?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await db
      .select()
      .from(Projects)
      .where(and(eq(Projects.id, id), eq(Projects.userId, session.user.sub)))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project[0]);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth0.getSession();
    if (!session?.user?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, status, recipients, editorData } = body;

    const updatedProject = await db
      .update(Projects)
      .set({
        name,
        type,
        status,
        recipients,
        editorData: editorData ? JSON.stringify(editorData) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(Projects.id, id), eq(Projects.userId, session.user.sub)))
      .returning();

    if (updatedProject.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProject[0]);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth0.getSession();
    if (!session?.user?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deletedProject = await db
      .delete(Projects)
      .where(and(eq(Projects.id, id), eq(Projects.userId, session.user.sub)))
      .returning();

    if (deletedProject.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
