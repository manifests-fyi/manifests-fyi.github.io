<script lang="ts">
  import createFuzzySearch from "@nozbe/microfuzz";
  import newGithubIssueUrl from "new-github-issue-url";

  interface Searchable {
    name: string;
    group: string;
    version: string;
    kind: string;
  }

  const issueUrl = newGithubIssueUrl({
    user: "manifests-fyi",
    repo: "manifests-fyi.github.io",
    title: "Resource Request: <resource-name>",
    body: `## New Resource Request
This is a request for a new resource to be added to the manifests-fyi project.
### Necessary Info
- **API Group** (eg. "apps", "gateway.networking.k8s.io"): 
- **API Version** (eg. "v1", "v1beta1"):
- **Kind** (eg. "Deployment", "Gateway"):
- **Project URL** (eg. "https://istio.io", "https://argoproj.github.io/cd/"):
- **CRD URL** (preferably versioned link to CRD manifests):
`,
  });

  let {
    resources = [],
    placeholder = `Try "HTTPRoute" or "istio"`,
  }: {
    resources: Searchable[];
    placeholder?: string;
  } = $props();

  let search = createFuzzySearch(resources, {
    key: "name",
    strategy: "smart",
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
            const range = ranges.find((r) => r.start <= index && r.end > index);
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

  let selectedIndex = $state(0);

  const handleNavigation = (event: KeyboardEvent) => {
    ["Enter", "Escape", "ArrowDown", "ArrowUp"].includes(event.key) &&
      event.preventDefault();

    if (!searchResults) {
      return;
    }

    if (event.key === "Enter") {
      const firstResult = searchResults[selectedIndex];
      if (firstResult) {
        window.location.href = `/${firstResult.group}/${firstResult.version}/${firstResult.kind}`;
      }
    }
    if (event.key === "Escape") {
      searchTerm = "";
      selectedIndex = 0;
    }
    if (event.key === "ArrowDown") {
      if (selectedIndex < searchResults.length - 1) {
        selectedIndex += 1;
      }
    }
    if (event.key === "ArrowUp") {
      if (selectedIndex > 0) {
        selectedIndex -= 1;
      }
    }

    const resultList = document.querySelector(".search-results");
    if (resultList) {
      const gapCss = getComputedStyle(resultList).gap;
      const gap = parseInt(gapCss.replace("px", ""));
      const selectedItem = resultList.children[selectedIndex];
      const borderWidth = parseInt(
        getComputedStyle(selectedItem).borderWidth.replace("px", ""),
      );
      const extraHeight = gap + borderWidth * 2;
      if (selectedItem) {
        const itemBottom = selectedItem.getBoundingClientRect().bottom;
        const itemTop = selectedItem.getBoundingClientRect().top;
        const listTop = resultList.getBoundingClientRect().top;
        const listBottom = resultList.getBoundingClientRect().bottom;

        if (itemBottom - selectedItem.clientHeight < listTop) {
          resultList.scrollTop -= selectedItem.clientHeight + extraHeight;
        } else if (itemTop + selectedItem.clientHeight > listBottom) {
          resultList.scrollTop += selectedItem.clientHeight + extraHeight;
        }
      }
    }
  };
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
      onkeydown={handleNavigation}
    />
  </search>
  {#if searchTerm}
    <ul class="search-results">
      {#if searchResults && searchResults.length > 0}
        {#each searchResults as result, index}
          <li
            class={`result-item ${index === selectedIndex ? "selected" : ""}`}
          >
            <a
              href={`/${result.group}/${result.version}/${result.kind}`}
              class="resource-name"
              style={`view-transition-name: "${result.group.replaceAll(
                ".",
                "-",
              )}-${result.version}-${result.kind}";`}
            >
              {@html result.nameHTML}
            </a>
          </li>
        {/each}
      {:else}
        <li class="no-results">
          <p>No results found for "{searchTerm}"</p>
          <p>
            If we're missing a resource you think should be here, please
            <a href={issueUrl}> open an issue. </a>
          </p>
        </li>
      {/if}
    </ul>
  {/if}
</article>

<style lang="postcss">
  @reference "../styles/global.css";
  .search-input {
    @apply w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 focus:outline-none;
    @apply shadow-lg;
  }

  .search-results {
    @apply mt-2 flex max-h-62 flex-col gap-2 overflow-hidden overflow-y-auto rounded-md border border-gray-300 bg-white p-2 shadow-lg;
  }

  .result-item {
    @apply cursor-pointer rounded-sm p-2 text-gray-700;
    @apply border border-transparent;
  }

  .result-item.selected {
    @apply rounded-sm border border-blue-300 bg-blue-100 text-blue-900;
  }

  .result-item:hover {
    @apply border border-gray-400 bg-gray-200 text-gray-800;
  }

  :global(.search-highlight) {
    @apply bg-green-200 text-green-900;
  }

  .resource-name {
    @apply font-medium text-gray-900;
  }

  .no-results {
    @apply flex w-full flex-col p-4 text-center text-gray-500;
  }
  .no-results p {
    @apply prose lg:prose-xl mx-auto;
  }
</style>
