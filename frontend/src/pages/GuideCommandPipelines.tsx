import React from 'react';
import { Typography } from '@mui/material';
import GuideArticleLayout from '../components/GuideArticleLayout';

const GuideCommandPipelines: React.FC = () => {
  return (
    <GuideArticleLayout
      title="grep vs sed vs awk: choosing the right text tool"
      description="A practical guide for Linux users who want fast, readable command pipelines instead of fragile one-liners."
      updatedOn="April 12, 2026"
      author="Linuxdle Editorial"
      keywords="grep sed awk tutorial, linux command line guide, text processing shell"
      toc={[
        { id: 'mental-model', label: 'Mental model: filter, transform, compute' },
        { id: 'tool-choice', label: 'When to choose each tool' },
        { id: 'examples', label: 'Operational examples from daily work' },
        { id: 'patterns', label: 'Patterns that keep pipelines maintainable' },
      ]}
    >
      <Typography id="mental-model" variant="h5" component="h2" fontWeight="bold">
        Mental model: filter, transform, compute
      </Typography>
      <Typography>
        Teams waste time when every text problem gets forced into whichever command they remember first.
        A cleaner approach is to classify the job before writing the pipeline. Use grep when the goal is binary filtering,
        sed when you need stream edits, and awk when records and fields drive the result. This model removes guesswork
        and makes one-liners explainable during incident response.
      </Typography>
      <Typography>
        The big win is not only speed. It is operational safety. If a command is obvious at a glance,
        another engineer can review it quickly before it touches production logs or config files.
      </Typography>

      <Typography id="tool-choice" variant="h5" component="h2" fontWeight="bold">
        When to choose each tool
      </Typography>
      <Typography>
        Choose grep when your question is: which lines match this pattern. It is optimized for search and scales well
        on large files, especially with simple patterns and fixed strings.
      </Typography>
      <Typography>
        Choose sed when your question is: how do I rewrite this stream with minimal context. It is ideal for line-based
        substitutions, deletions, and quick cleanup operations in CI scripts.
      </Typography>
      <Typography>
        Choose awk when your question is: how do I compute over structured fields. If you need sums, conditional logic,
        grouping, or report-like output, awk usually produces the clearest result.
      </Typography>

      <Typography id="examples" variant="h5" component="h2" fontWeight="bold">
        Operational examples from daily work
      </Typography>
      <Typography>
        Example 1: triaging authentication failures from a rotated log set. Start with grep to isolate failures,
        then pass to awk to summarize counts by source IP. This two-step split is clearer than a single dense regex.
      </Typography>
      <Typography>
        Example 2: normalizing environment files before deployment. Use sed for deterministic substitutions,
        but keep each rewrite in a separate expression and comment the reason in scripts. This prevents accidental
        changes to similar-looking keys.
      </Typography>
      <Typography>
        Example 3: extracting package age from command output. Awk is stronger than chained cut calls because you can
        keep parsing, filtering, and formatting in one readable block.
      </Typography>

      <Typography id="patterns" variant="h5" component="h2" fontWeight="bold">
        Patterns that keep pipelines maintainable
      </Typography>
      <Typography>
        Prefer small composable stages over one giant command. Use grep for selection, awk for computation,
        and leave sed for explicit transformations. Name intermediate intent in shell scripts with comments,
        and test commands against representative sample files before running on full data.
      </Typography>
      <Typography>
        Finally, document assumptions: log format version, delimiter expectations, and locale behavior.
        Most broken pipelines fail because assumptions stayed implicit. Make them visible and your command line
        tooling becomes production-grade rather than puzzle-grade.
      </Typography>
    </GuideArticleLayout>
  );
};

export default GuideCommandPipelines;
