export function ArchitectureDiagram() {
  return (
    <div className="bloom-panel overflow-x-auto rounded-xl bg-bloom-surface p-4 sm:p-6">
      <svg
        viewBox="0 0 920 520"
        className="mx-auto h-auto w-full min-w-[640px] max-w-4xl"
        role="img"
        aria-label="Bloom high-level architecture diagram"
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--primary)" />
          </marker>
        </defs>

        <rect
          x="40"
          y="40"
          width="180"
          height="70"
          rx="10"
          fill="var(--secondary)"
          stroke="var(--border)"
          strokeWidth="2"
        />
        <text
          x="130"
          y="70"
          textAnchor="middle"
          fill="var(--foreground)"
          style={{ fontSize: 14, fontWeight: 700 }}
        >
          Developer
        </text>
        <text
          x="130"
          y="92"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
        >
          terminal · browser
        </text>

        <rect
          x="320"
          y="30"
          width="220"
          height="140"
          rx="12"
          fill="var(--bloom-dialog)"
          stroke="var(--border)"
          strokeWidth="3"
        />
        <text
          x="430"
          y="58"
          textAnchor="middle"
          fill="var(--primary)"
          style={{ fontSize: 15, fontWeight: 700 }}
        >
          Bloom CLI (TUI)
        </text>
        <text
          x="430"
          y="82"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
        >
          OpenTUI · slash cmds
        </text>
        <text
          x="430"
          y="104"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
        >
          local tools · cwd sandbox
        </text>
        <text
          x="430"
          y="126"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
        >
          ~/.bloom/auth.json
        </text>
        <text
          x="430"
          y="148"
          textAnchor="middle"
          fill="var(--bloom-gold)"
          style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
        >
          Build / Plan modes
        </text>

        <rect
          x="640"
          y="40"
          width="240"
          height="90"
          rx="12"
          fill="var(--bloom-dialog)"
          stroke="var(--border)"
          strokeWidth="3"
        />
        <text
          x="760"
          y="72"
          textAnchor="middle"
          fill="var(--primary)"
          style={{ fontSize: 15, fontWeight: 700 }}
        >
          Web (Next.js)
        </text>
        <text
          x="760"
          y="96"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
        >
          docs · install scripts
        </text>
        <text
          x="760"
          y="116"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
        >
          /cli/auth handoff only
        </text>

        <rect
          x="320"
          y="230"
          width="220"
          height="120"
          rx="12"
          fill="var(--secondary)"
          stroke="var(--border)"
          strokeWidth="3"
        />
        <text
          x="430"
          y="262"
          textAnchor="middle"
          fill="var(--secondary-foreground)"
          style={{ fontSize: 15, fontWeight: 700 }}
        >
          API (Hono)
        </text>
        <text
          x="430"
          y="286"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
        >
          chat stream · sessions
        </text>
        <text
          x="430"
          y="308"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
        >
          CLI auth · quotas
        </text>
        <text
          x="430"
          y="330"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
        >
          Better Auth
        </text>

        <rect
          x="320"
          y="400"
          width="220"
          height="70"
          rx="12"
          fill="var(--bloom-dialog)"
          stroke="var(--border)"
          strokeWidth="3"
        />
        <text
          x="430"
          y="430"
          textAnchor="middle"
          fill="var(--primary)"
          style={{ fontSize: 14, fontWeight: 700 }}
        >
          Postgres
        </text>
        <text
          x="430"
          y="450"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
        >
          users · sessions · tokens
        </text>

        <rect
          x="640"
          y="250"
          width="240"
          height="90"
          rx="12"
          fill="var(--bloom-dialog)"
          stroke="var(--border)"
          strokeWidth="3"
        />
        <text
          x="760"
          y="282"
          textAnchor="middle"
          fill="var(--primary)"
          style={{ fontSize: 14, fontWeight: 700 }}
        >
          Model providers
        </text>
        <text
          x="760"
          y="306"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
        >
          Google · Groq
        </text>
        <text
          x="760"
          y="326"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
        >
          selected via /models
        </text>

        <rect
          x="40"
          y="250"
          width="180"
          height="90"
          rx="12"
          fill="var(--bloom-dialog)"
          stroke="var(--border)"
          strokeWidth="2"
        />
        <text
          x="130"
          y="282"
          textAnchor="middle"
          fill="var(--foreground)"
          style={{ fontSize: 13, fontWeight: 700 }}
        >
          Project cwd
        </text>
        <text
          x="130"
          y="306"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
        >
          read / write / bash
        </text>
        <text
          x="130"
          y="326"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
        >
          sandboxed tools
        </text>

        <line
          x1="220"
          y1="75"
          x2="318"
          y2="75"
          stroke="var(--primary)"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />
        <line
          x1="430"
          y1="170"
          x2="430"
          y2="228"
          stroke="var(--primary)"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />
        <line
          x1="430"
          y1="350"
          x2="430"
          y2="398"
          stroke="var(--primary)"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />
        <line
          x1="540"
          y1="80"
          x2="638"
          y2="80"
          stroke="var(--primary)"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />
        <line
          x1="760"
          y1="130"
          x2="520"
          y2="250"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          markerEnd="url(#arrow)"
        />
        <line
          x1="540"
          y1="290"
          x2="638"
          y2="290"
          stroke="var(--primary)"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />
        <line
          x1="220"
          y1="290"
          x2="318"
          y2="120"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          markerEnd="url(#arrow)"
        />

        <text
          x="270"
          y="64"
          fill="var(--muted-foreground)"
          style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
        >
          bloom
        </text>
        <text
          x="448"
          y="205"
          fill="var(--muted-foreground)"
          style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
        >
          HTTPS
        </text>
        <text
          x="560"
          y="68"
          fill="var(--muted-foreground)"
          style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
        >
          /login opens
        </text>
      </svg>
    </div>
  );
}
