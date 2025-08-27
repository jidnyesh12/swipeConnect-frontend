import React from "react";

const LoadingSpinner = ({
  title = "Loading",
  subtitle = "Please wait...",
  size = "default",
  variant = "default",
}) => {
  const sizeClasses = {
    small: "w-8 h-8",
    default: "w-12 h-12",
    large: "w-16 h-16",
  };

  const containerClasses = {
    small: "p-4",
    default: "p-8",
    large: "p-12",
  };

  const titleClasses = {
    small: "text-lg",
    default: "text-xl",
    large: "text-2xl",
  };

  const variants = {
    default: {
      container: "card text-center max-w-md",
      spinner: "border-slate-300 border-t-slate-700",
      title: "text-slate-800 font-semibold mb-2",
      subtitle: "text-slate-600",
    },
    fullscreen: {
      container: "min-h-screen bg-primary flex items-center justify-center p-4",
      card: "card text-center max-w-md",
      spinner: "border-slate-300 border-t-slate-700",
      title: "text-slate-800 font-semibold mb-2",
      subtitle: "text-slate-600",
    },
    inline: {
      container: "flex items-center justify-center space-x-3 p-4",
      spinner: "border-slate-300 border-t-slate-700",
      title: "text-slate-800 font-medium",
      subtitle: "text-slate-600 text-sm",
    },
  };

  const currentVariant = variants[variant];

  if (variant === "fullscreen") {
    return (
      <div className={currentVariant.container}>
        <div className={currentVariant.card}>
          <div className={containerClasses[size]}>
            <div
              className={`${sizeClasses[size]} border-4 ${currentVariant.spinner} rounded-full animate-spin mx-auto mb-4`}
            ></div>
            <h2 className={`${titleClasses[size]} ${currentVariant.title}`}>
              {title}
            </h2>
            {subtitle && <p className={currentVariant.subtitle}>{subtitle}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={currentVariant.container}>
        <div
          className={`${sizeClasses[size]} border-4 ${currentVariant.spinner} rounded-full animate-spin`}
        ></div>
        <div>
          <h3 className={currentVariant.title}>{title}</h3>
          {subtitle && <p className={currentVariant.subtitle}>{subtitle}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={currentVariant.container}>
      <div className={containerClasses[size]}>
        <div
          className={`${sizeClasses[size]} border-4 ${currentVariant.spinner} rounded-full animate-spin mx-auto mb-4`}
        ></div>
        <h2 className={`${titleClasses[size]} ${currentVariant.title}`}>
          {title}
        </h2>
        {subtitle && <p className={currentVariant.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
