import React from "react";

interface SvgIconProps {
  svg: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  size?: number;
  color?: string;
  className?: string;
}

export const SvgIcon = ({ svg, size, color = "currentColor", className }: SvgIconProps) => {
  return React.cloneElement(svg, {
    width: size ?? svg.props.width,
    height: size ?? svg.props.height,
    className,
    children: React.Children.map(svg.props.children, (child) => {
      if (!React.isValidElement(child)) return child;
      return React.cloneElement(child as React.ReactElement<{ fill?: string }>, {
        fill: color,
      });
    }),
  });
};