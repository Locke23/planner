import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WorkspaceSlugParam = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.params.slug;
  },
);
