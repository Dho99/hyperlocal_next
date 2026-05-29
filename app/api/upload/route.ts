import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { UPLOAD_CONFIG } from "@/lib/upload/config";
import {
    ensureUploadDir,
    generateUniqueFilename,
    validateSafePath,
} from "@/lib/upload/storage";
import { optimizeImage } from "@/lib/upload/optimizeImage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        // Optional: Check auth
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const folder = req.nextUrl.searchParams.get("folder") || "destinations";

        if (!file) {
            return NextResponse.json(
                { success: false, message: "No file uploaded" },
                { status: 400 },
            );
        }

        // Validation
        if (!UPLOAD_CONFIG.allowedMimeTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, message: "Invalid file type" },
                { status: 400 },
            );
        }

        if (file.size > UPLOAD_CONFIG.maxFileSize) {
            return NextResponse.json(
                { success: false, message: "File size too large (max 5MB)" },
                { status: 400 },
            );
        }

        if (!UPLOAD_CONFIG.validFolders.includes(folder)) {
            return NextResponse.json(
                { success: false, message: "Invalid target folder" },
                { status: 400 },
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Optimization
        const optimizedBuffer = await optimizeImage(buffer);

        // Storage
        const targetDir = await ensureUploadDir(folder);
        const filename = generateUniqueFilename(folder);
        const filePath = path.join(targetDir, filename);

        await writeFile(filePath, optimizedBuffer);

        const publicUrl = `${UPLOAD_CONFIG.publicPath}/${folder}/${filename}`;

        return NextResponse.json({
            success: true,
            message: "Image uploaded successfully",
            data: {
                filename,
                path: publicUrl,
                url: `${publicUrl}`,
                size: optimizedBuffer.length,
                mimeType: "image/webp",
            },
        });
    } catch (error: unknown) {
        console.error("Upload error:", error);
        return NextResponse.json(
            {
                success: false,
                message: (error as Error).message || "Internal server error",
            },
            { status: 500 },
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const { url } = await req.json();

        if (!url) {
            return NextResponse.json(
                { success: false, message: "No URL provided" },
                { status: 400 },
            );
        }

        const fullPath = validateSafePath(url);

        await unlink(fullPath);

        return NextResponse.json({
            success: true,
            message: "File deleted successfully",
        });
    } catch (error: unknown) {
        console.error("Delete error:", error);
        return NextResponse.json(
            {
                success: false,
                message: (error as Error).message || "Internal server error",
            },
            { status: 500 },
        );
    }
}
