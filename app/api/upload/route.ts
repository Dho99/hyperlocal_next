import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { UPLOAD_CONFIG, FOLDER_MAPPING } from "@/lib/upload/config";
import { optimizeImage } from "@/lib/upload/optimizeImage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

function extractPublicId(url: string): string | null {
    try {
        const { pathname } = new URL(url);
        const match = pathname.match(/\/image\/upload\/v\d+\/(.+)\.\w+$/);
        if (match) return match[1];
        const match2 = pathname.match(/\/image\/upload\/(.+)\.\w+$/);
        if (match2) return match2[1];
        return null;
    } catch {
        return null;
    }
}

export async function POST(req: NextRequest) {
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

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const folder = req.nextUrl.searchParams.get("folder") || "destinations";

        if (!file) {
            return NextResponse.json(
                { success: false, message: "No file uploaded" },
                { status: 400 },
            );
        }

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
        const optimizedBuffer = await optimizeImage(buffer);

        const cloudinaryFolder = FOLDER_MAPPING[folder] ?? `hyperlocal/${folder}`;

        const result = await new Promise<{
            public_id: string;
            secure_url: string;
            bytes: number;
            format: string;
        }>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: cloudinaryFolder,
                    resource_type: "auto",
                    quality: "auto",
                    fetch_format: "auto",
                    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
                },
                (error, result) => {
                    if (error) reject(error);
                    else if (result) resolve(result);
                    else reject(new Error("Upload returned no result"));
                },
            );
            uploadStream.end(optimizedBuffer);
        });

        return NextResponse.json({
            success: true,
            message: "Image uploaded successfully",
            data: {
                filename: result.public_id,
                path: result.secure_url,
                url: result.secure_url,
                size: result.bytes,
                mimeType: result.format,
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

        const publicId = extractPublicId(url);

        if (!publicId) {
            return NextResponse.json(
                { success: false, message: "Invalid Cloudinary URL" },
                { status: 400 },
            );
        }

        await cloudinary.uploader.destroy(publicId);

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
