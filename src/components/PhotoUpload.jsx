import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constant";

const PhotoUpload = ({
  currentPhoto,
  onPhotoUpdate,
  onError,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      onError("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    setUploading(true);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await axios.post(`${BASE_URL}/user/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      onPhotoUpdate(response.data.photoUrl, response.data.user);
      setPreview(null); // Clear preview since we now have the actual photo
    } catch (error) {
      console.error("Upload failed:", error);
      onError(error.response?.data?.message || "Photo upload failed");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const displayPhoto = preview || currentPhoto;

  return (
    <div className="space-y-4">
      {/* Photo Display */}
      {displayPhoto && (
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={displayPhoto}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full border-4 border-slate-200 shadow-lg"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-center">
        <label
          className={`cursor-pointer ${
            disabled || uploading ? "cursor-not-allowed" : ""
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
          />
          <div
            className={`inline-flex items-center px-6 py-3 border-2 border-dashed rounded-lg transition-all duration-200 ${
              disabled || uploading
                ? "border-slate-300 bg-slate-50 cursor-not-allowed opacity-50"
                : "border-slate-400 hover:border-slate-600 hover:bg-slate-50 cursor-pointer"
            }`}
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-slate-700">
                  Uploading...
                </span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="text-sm font-medium text-slate-700">
                  {currentPhoto ? "Change Photo" : "Upload Photo"}
                </span>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Upload Info */}
      <p className="text-xs text-slate-500 text-center">
        Supported: JPG, PNG, GIF, WebP • Max 5MB • Automatically resized to
        500x500px
      </p>
    </div>
  );
};

export default PhotoUpload;
