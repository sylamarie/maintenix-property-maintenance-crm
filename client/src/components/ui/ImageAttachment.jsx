import { useState } from 'react';

const ImageAttachment = ({
  src,
  alt = 'Attachment preview',
  loading = 'lazy'
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src) {
    return null;
  }

  return (
    <figure className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-sm">
      <div className="h-44 w-full overflow-hidden bg-ink-50">
        {!hasError ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            loading={loading}
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-ink-500">
            Photo preview unavailable
          </div>
        )}
      </div>
      <figcaption className="no-print flex justify-end border-t border-ink-100 px-3 py-2">
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-brand-700 hover:text-brand-900"
        >
          Open photo
        </a>
      </figcaption>
    </figure>
  );
};

export default ImageAttachment;
