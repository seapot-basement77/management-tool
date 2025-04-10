import { FC } from "react";
import Image from "next/image";

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = imageUrl.split("/").pop() || "image"; // ファイル名を取得
    link.click();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "80vw",
          height: "80vh",
          backgroundColor: "#222",
          borderRadius: "10px",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()} // バックグラウンドクリック防止
      >
        <Image
          src={imageUrl}
          alt="modal"
          layout="fill"
          objectFit="contain"
          unoptimized
        />

        {/* ダウンロードボタン */}
        <button
          onClick={handleDownload}
          style={{
            position: "absolute",
            top: "1rem",
            right: "5rem",
            background: "#4caf50",
            border: "none",
            borderRadius: "5px",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            color: "white",
            fontWeight: "bold",
          }}
        >
          ⬇️ Download
        </button>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "red",
            border: "none",
            borderRadius: "5px",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            color: "white",
            fontWeight: "bold",
          }}
        >
          ✖
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
