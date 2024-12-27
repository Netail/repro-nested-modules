import { FC, PropsWithChildren } from "react";
import { FaroObservability } from '@repo/client-observability/src/faro/component';

const RootLayout: FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <html lang="en">
      <body>
        {children}
        <FaroObservability/>
      </body>
    </html>
  );
}

export default RootLayout;
