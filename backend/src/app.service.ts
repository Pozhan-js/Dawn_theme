import { Injectable } from '@nestjs/common';

export interface PocItem {
  id: number;
  title: string;
  description: string;
}

@Injectable()
export class AppService {
  getPocData(): { source: string; generatedAt: string; items: PocItem[] } {
    return {
      source: 'NestJS scaffold API',
      generatedAt: new Date().toISOString(),
      items: [
        {
          id: 1,
          title: 'Liquid 挂载点',
          description:
            'Shopify section 输出 DOM 容器，并把接口地址写入 data 属性。',
        },
        {
          id: 2,
          title: 'Vue 3 局部组件',
          description:
            'Vue 只接管当前 section 内的元素，不影响 Dawn 其他结构。',
        },
        {
          id: 3,
          title: 'Nest 后端接口',
          description:
            '组件通过 fetch 请求本地 Nest API，并把返回数据渲染到页面。',
        },
      ],
    };
  }
}
