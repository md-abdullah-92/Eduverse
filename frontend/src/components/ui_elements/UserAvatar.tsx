'use client';

type UserAvatarProps = {
  name: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
};

export const UserAvatar = ({ name, image, size = 'md' }: UserAvatarProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  };

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-sky-100 text-sky-900 font-semibold flex items-center justify-center`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
};
