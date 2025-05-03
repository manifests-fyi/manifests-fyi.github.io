<script lang="ts">
  import createFuzzySearch from "@nozbe/microfuzz";

  interface Searchable {
    name: string;
    group: string;
    version: string;
    kind: string;
  }

  let {
    resources = [],
    placeholder = "Search Kubernetes resources...",
  }: {
    resources: Searchable[];
    placeholder?: string;
  } = $props();

  let search = createFuzzySearch(resources, {
    key: "name",
    strategy: "aggressive",
  });

  let searchTerm = $state("");

  let searchResults = $derived.by(() => {
    if (!searchTerm) {
      return null;
    }

    return search(searchTerm).map((result) => {
      const name = result.item.name;
      const group = result.item.group;
      const version = result.item.version;
      const kind = result.item.kind;

      const ranges = result.matches.flatMap((match) => {
        return match!.map(([start, end]) => {
          return {
            start,
            end,
          };
        });
      });

      let isHighlighted = false;
      const nameHTML = name
        .split("")
        .reduce(
          (acc, char, index) => {
            const range = ranges.find(
              (r) => r.start <= index && r.end >= index,
            );
            if (range) {
              acc.push({
                char,
                highlight: true,
              });
            } else {
              acc.push({
                char,
                highlight: false,
              });
            }
            return acc;
          },
          [] as { char: string; highlight: boolean }[],
        )
        .map((item) => {
          if (!isHighlighted && item.highlight) {
            isHighlighted = true;
            return `<span class="search-highlight">` + item.char;
          } else if (isHighlighted && !item.highlight) {
            isHighlighted = false;
            return item.char + "</span>";
          } else {
            return item.char;
          }
        })
        .join("");

      return {
        name,
        group,
        version,
        kind,
        nameHTML,
      };
    });
  });
</script>

<article>
  <search>
    <label for="search" class="sr-only">
      {placeholder}
    </label>
    <input
      type="text"
      bind:value={searchTerm}
      {placeholder}
      class="search-input"
    />
  </search>
  {#if searchTerm}
    <ul class="search-results">
      {#if searchResults && searchResults.length > 0}
        {#each searchResults as result}
          <li class="result-item">
            <a
              href={`/${result.group}/${result.version}/${result.kind}`}
              class="resource-name"
            >
              {@html result.nameHTML}
            </a>
          </li>
        {/each}
      {:else}
        <li class="no-results">
          <p>No results found for "{searchTerm}"</p>
        </li>
      {/if}
    </ul>
  {/if}
</article>

<style lang="postcss">
  @reference "../styles/global.css";
  .search-container {
    @apply mb-4;
  }

  .search-input {
    @apply w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none;
  }

  .results-list {
    @apply max-h-96 divide-y divide-gray-100 overflow-y-auto rounded-md border border-gray-200;
  }

  .result-item {
    @apply p-3 hover:bg-gray-50;
  }

  .resource-name {
    @apply font-medium text-gray-900;
  }

  .resource-details {
    @apply mt-1 space-x-2 text-sm text-gray-600;
  }

  .resource-group,
  .resource-version,
  .resource-kind {
    @apply inline-block;
  }

  .resource-group::after,
  .resource-version::after {
    @apply mx-1 text-gray-400 content-["/"];
  }

  .no-results {
    @apply p-4 text-center text-gray-500;
  }

  .search-highlight {
    @apply font-bold text-blue-600;
  }
</style>
