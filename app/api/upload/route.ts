import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { requireAuth, requireFamilyMembership } from "@/lib/auth-utils"

export async function POST(req: NextRequest) {
  try {
    try {
      await requireAuth()
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    const formData = await req.formData()
    const file = formData.get("file") as File
    const familyId = formData.get("familyId")
    
    if (!file || typeof familyId !== "string" || familyId.trim() === "") {
      return NextResponse.json(
        { error: "File and family ID are required" },
        { status: 400 }
      )
    }

    try {
      await requireFamilyMembership(familyId)
    } catch (error) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      )
    }

    // Validate file type (images and PDFs)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images and PDFs are allowed." },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "receipts")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const filename = `receipt-${timestamp}.${ext}`
    const filepath = join(uploadsDir, filename)

    // Save file
    await writeFile(filepath, buffer)

    return NextResponse.json({
      success: true,
      url: `/uploads/receipts/${filename}`,
      fileName: file.name
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}

