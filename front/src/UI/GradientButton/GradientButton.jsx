import React from 'react';
import { Button, ConfigProvider } from 'antd';
import { createStyles } from 'antd-style';

// Создаем стили БЕЗ параметров
const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(
        .${prefixCls}-btn-dangerous
      ) {
      > span {
        position: relative;
      }
      &::before {
        content: '';
        background: var(
          --gradient-colors,
          linear-gradient(135deg, #6253e1, #04befe)
        );
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }
      &:hover::before {
        opacity: 0;
      }
    }
  `,
}));

const GradientButton = ({
  children,
  icon,
  size = 'large',
  type = 'primary',
  colors = ['#6253e1', '#04befe'],
  ...props
}) => {
  const { styles } = useStyle();

  // Создаем inline стиль для градиента
  const gradientStyle = {
    '--gradient-colors': `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
  };

  return (
    <ConfigProvider button={{ className: styles.linearGradientButton }}>
      <Button
        type={type}
        size={size}
        icon={icon}
        {...props}
        style={{ ...gradientStyle, ...props.style }}
      >
        {children}
      </Button>
    </ConfigProvider>
  );
};

export default GradientButton;
