import type { Components } from "react-markdown";

/** react-markdown passes its AST node to custom components; it must not end up as a DOM attribute. */
function omitNode<P extends { node?: unknown }>({ node, ...rest }: P): Omit<P, "node"> {
  void node;
  return rest;
}

export const markdownComponents: Components = {
  h1: (props) => (
    <h1 className="mt-10 mb-4 text-[26px] leading-[1.12] font-light tracking-[-0.26px] text-ink first:mt-0" {...omitNode(props)} />
  ),
  h2: (props) => (
    <h2 className="mt-8 mb-3 text-[22px] leading-[1.1] font-light tracking-[-0.22px] text-ink first:mt-0" {...omitNode(props)} />
  ),
  h3: (props) => (
    <h3 className="mt-6 mb-2 text-[18px] leading-[1.4] font-light text-ink first:mt-0" {...omitNode(props)} />
  ),
  h4: (props) => <h4 className="mt-5 mb-2 text-[15px] font-normal text-ink" {...omitNode(props)} />,
  h5: (props) => <h5 className="mt-4 mb-2 text-[15px] font-normal text-ink" {...omitNode(props)} />,
  h6: (props) => <h6 className="mt-4 mb-2 text-[13px] font-normal text-ink-mute" {...omitNode(props)} />,
  p: (props) => (
    <p className="my-3 text-[15px] leading-[1.6] whitespace-pre-line text-ink-secondary" {...omitNode(props)} />
  ),
  ul: (props) => (
    <ul className="my-3 list-disc space-y-1 pl-6 text-[15px] leading-[1.6] text-ink-secondary" {...omitNode(props)} />
  ),
  ol: (props) => (
    <ol className="my-3 list-decimal space-y-1 pl-6 text-[15px] leading-[1.6] text-ink-secondary" {...omitNode(props)} />
  ),
  a: (props) => (
    <a className="text-primary hover:text-primary-deep hover:underline" target="_blank" rel="noopener noreferrer" {...omitNode(props)} />
  ),
  blockquote: (props) => (
    <blockquote className="my-4 border-l-2 border-primary-subdued pl-4 text-ink-mute" {...omitNode(props)} />
  ),
  hr: (props) => <hr className="my-6 border-hairline" {...omitNode(props)} />,
  code: (props) => (
    <code className="rounded-[4px] bg-canvas-soft px-1 py-0.5 font-mono text-[13px] text-ink" {...omitNode(props)} />
  ),
  pre: (props) => (
    <pre
      className="my-4 overflow-x-auto rounded-[8px] bg-brand-dark p-4 font-mono text-[13px] leading-[1.5] text-white [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit"
      {...omitNode(props)}
    />
  ),
  table: (props) => (
    <div className="my-4 overflow-x-auto rounded-[8px] border border-hairline">
      <table className="w-full text-left text-[14px] tracking-[-0.42px] [font-feature-settings:'tnum']" {...omitNode(props)} />
    </div>
  ),
  thead: (props) => <thead className="bg-canvas-soft text-[13px] text-ink-mute" {...omitNode(props)} />,
  th: (props) => <th className="px-4 py-2 font-normal whitespace-nowrap" {...omitNode(props)} />,
  td: (props) => <td className="border-t border-hairline px-4 py-2 text-ink-secondary" {...omitNode(props)} />,
};
