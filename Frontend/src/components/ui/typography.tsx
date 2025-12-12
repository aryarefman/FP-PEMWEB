import React from "react";

type Variant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "p"
  | "blockquote"
  | "lead"
  | "large"
  | "small"
  | "muted"
  | "inlineCode"
  | "list";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

export function Typography({
  children,
  variant = "p",
  className = "",
  style,
  ...props
}: TypographyProps) {



  switch (variant) {
    case "h1":
      return (
        <h1
          {...props}
          style={style}
          className={`scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance ${className}`}
        >
          {children}
        </h1>
      );
    case "h2":
      return (
        <h2
          {...props}
          style={style}
          className={`scroll-m-20 pb-2 text-3xl font-semibold tracking-tight ${className}`}
        >
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3
          {...props}
          style={style}
          className={`scroll-m-20 text-2xl font-semibold tracking-tight ${className}`}
        >
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4
          {...props}
          style={style}
          className={`scroll-m-20 text-xl font-semibold tracking-tight ${className}`}
        >
          {children}
        </h4>
      );
    case "p":
      return <p {...props} style={style} className={`not-first:mt-2yp ${className}`}>{children}</p>;
    case "blockquote":
      return (
        <blockquote {...props} style={style} className={`mt-2 border-l-2 pl-2 italic ${className}`}>
          {children}
        </blockquote>
      );
    case "lead":
      return (
        <p {...props} style={style} className={`text-muted-foreground text-xl ${className}`}>
          {children}
        </p>
      );
    case "large":
      return <div {...props} style={style} className={`text-lg ${className}`}>{children}</div>;
    case "small":
      return (
        <small {...props} style={style} className={`text-sm leading-none ${className}`}>
          {children}
        </small>
      );
    case "muted":
      return (
        <p {...props} style={style} className={`text-muted-foreground text-sm ${className}`}>
          {children}
        </p>
      );
    case "inlineCode":
      return (
        <code
          {...props}
          style={style}
          className={`bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm ${className}`}
        >
          {children}
        </code>
      );
    case "list":
      return (
        <ul {...props} style={style} className={`my-6 ml-6 list-disc [&>li]:mt-2 ${className}`}>
          {children}
        </ul>
      );
    default:
      return <p {...props} style={style} className={className}>{children}</p>;
  }
}
