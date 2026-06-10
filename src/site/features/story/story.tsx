import { Keycap, KeycapSequence } from "@/demo";
import { Button } from "@/site/ui/button/button";
import { Eyebrow } from "@/site/ui/eyebrow/eyebrow";

import { LegendDemo } from "./legend-demo";
import styles from "./story.module.css";
import { TableOfContents } from "./table-of-contents";

function StoryCta({ onOpenDemo }: { onOpenDemo: () => void }) {
  return (
    <div className={styles.storyCta}>
      <div>
        <p className={styles.ctaKicker}>See it for yourself</p>
        <p className={styles.ctaText}>
          The whole argument is in the interaction — two minutes, live.
        </p>
      </div>
      <Button variant="primary" onClick={onOpenDemo}>
        Open the logs
      </Button>
    </div>
  );
}

/* Each section opens with a short eyebrow that matches its table-of-
 * contents label, then a sentence-like heading carrying the section's
 * actual point — the eyebrow is for scanning, the heading for reading. */
function SectionHead({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.sectionHead}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className={styles.heading}>{children}</h2>
    </div>
  );
}

export function Story({ onOpenDemo }: { onOpenDemo: () => void }) {
  return (
    <div className={styles.layout}>
      <TableOfContents />
      <article className={styles.article}>
        <header className={styles.proseHead}>
          <Eyebrow>The build story</Eyebrow>
          <h1 className={styles.proseTitle}>
            A log explorer that <em>doesn’t lose your place</em>.
          </h1>
          <p className={styles.proseLead}>
            A working prototype, and the story of building it. I went looking
            for a paper cut worth fixing — a small, real, unglamorous problem —
            and built the fix one decision at a time. The demo is the argument;
            this is the reasoning behind it.
          </p>
        </header>

        <section id="the-problem" tabIndex={-1} className={styles.section}>
          <SectionHead eyebrow="The problem">
            Chasing an ID scatters the investigation across tabs
          </SectionHead>
          <p className={styles.body}>
            You’re troubleshooting a live incident. Logs are tailing. You’ve
            filtered to a single request ID — the failing one — and the picture
            is finally narrowing. You click a line to see the context around it:
            the calls before, the calls after.
          </p>
          <p className={styles.body}>A new tab opens.</p>
          <p className={styles.body}>
            The context is there, but nothing else is — no filter, no live tail,
            just a slice. Your narrowed view is waiting back in the first tab,
            so you flip over, find the next interesting line, and click again.
            Another tab. By the time you’ve worked through the incident you have
            a fan of tabs, each holding one slice of the story, and you’re
            piecing the timeline back together by switching between them.
          </p>

          <blockquote className={styles.pullQuote}>
            <p>
              The work of narrowing in doesn’t follow you to where you look at
              it.
            </p>
          </blockquote>
        </section>

        <section id="the-idea" tabIndex={-1} className={styles.section}>
          <SectionHead eyebrow="The idea">
            Open context where the line lives
          </SectionHead>
          <p className={styles.body}>
            Click a line — call it the anchor — and the rows around it expand
            inline, dimmed for contrast so the matching lines stay bright. Open
            a second context without losing the first. The filter doesn’t reset.
            The position doesn’t reset. The view stays in place; the application
            carries the state it should have been carrying all along.
          </p>
        </section>

        <StoryCta onOpenDemo={onOpenDemo} />

        <section id="what-i-built" tabIndex={-1} className={styles.section}>
          <SectionHead eyebrow="What I built">
            A small prototype built around one tight incident
          </SectionHead>
          <p className={styles.body}>
            The investigation moment is the whole subject. The logs are mocked,
            filtering is three preset chips, and there’s no search, no
            virtualization, no loading states. Everything else was cut to keep
            the subject in frame.
          </p>
          <p className={styles.body}>
            The mock data got real work, though. It tells one tight incident — a
            config reload quietly shrinks a database pool, checkout starts
            failing, a reverse reload recovers it — and the cause line carries
            no request ID, so the trace filter can never surface it. Only
            context can. Every chip points at a moment in that story, and the
            demo’s root-cause call is answerable from the lines alone.
          </p>
        </section>

        <section id="the-cut" tabIndex={-1} className={styles.section}>
          <SectionHead eyebrow="The cut">
            The animation looked great but wasn’t doing the work
          </SectionHead>
          <p className={styles.body}>
            My first instinct was to make context appear with motion: click an
            anchor, and the rows above and below grow out of it smoothly. I
            built it, and at a few dozen lines it looked great. At real log
            volumes it wouldn’t have — virtualization mounts and unmounts rows
            as you scroll, and the animation breaks with them.
          </p>
          <p className={styles.body}>
            But that wasn’t the real reason it went. The animation wasn’t doing
            work the prototype needed: the fan of tabs collapses the moment
            context opens in place, and a smooth reveal doesn’t close that gap
            any further. What in-place context <em>does</em> open up is a
            different problem — with several contexts in one long list,
            navigation and orientation become the design work. And since logs
            are read by developers, keyboard parity with the mouse isn’t a
            nice-to-have. So the animation went, and the next problem came
            forward.
          </p>
        </section>

        <section id="the-legend" tabIndex={-1} className={styles.section}>
          <SectionHead eyebrow="The Legend">
            A static hint grew into the primary surface
          </SectionHead>
          <p className={styles.body}>
            The Legend wasn’t designed up front. It started as a static{" "}
            <Keycap>?</Keycap> hint in the corner and became the prototype’s
            primary interaction surface — adaptive, clickable, and alive to its
            own firings. Each piece arrived as the answer to a problem the last
            one left behind.
          </p>
          <p className={styles.body}>
            The first design put <strong>More</strong> and <strong>Less</strong>{" "}
            buttons on each anchor. They worked until you scrolled; the anchor
            left the screen and took the buttons with it. The keyboard bindings
            — <KeycapSequence keys={["Shift", "E"]} decorative={false} /> to
            expand the most recent context, <Keycap>Esc</Keycap> to close it —
            kept working from anywhere, and with one path strictly worse, the
            buttons had to go. That left mouse users with a gap.
          </p>
          <p className={styles.body}>
            The corner hint closed it. It grew into a small toolbar that
            surfaces a binding only while pressing it would do something:{" "}
            <KeycapSequence keys={["Shift", "E"]} decorative={false} /> appears
            when there’s a context to expand, <Keycap>Esc</Keycap> when there’s
            one to close, <Keycap>E</Keycap> for the focused line. Each entry is
            also a button, so a click and a key press fire exactly the same
            action. When nothing applies, it falls back to <Keycap>?</Keycap> +{" "}
            <em>shortcuts</em> — the surface is never empty.
          </p>

          <blockquote className={styles.pullQuote}>
            <p>Only show a binding when pressing it would do something.</p>
          </blockquote>

          <p className={styles.body}>
            That’s the rule, and three entries turned out to be the cap before
            the bar felt busy — <Keycap>[</Keycap> and <Keycap>]</Keycap> for
            hopping between anchors stayed in the shortcut sheet instead. One
            quieter problem remained: if you’d scrolled away from the context{" "}
            <KeycapSequence keys={["Shift", "E"]} decorative={false} /> was
            expanding, the press did nothing you could see. Auto-scrolling to
            the result has no right answer — a context grows in two directions
            at once — so the acknowledgement lives with the press itself. The
            entry pulses: a brief fade, gated behind{" "}
            <code>prefers-reduced-motion</code>, catching the eye in the
            periphery. <em>Something happened.</em>
          </p>

          <LegendDemo />
        </section>

        <section id="whats-next" tabIndex={-1} className={styles.section}>
          <SectionHead eyebrow="What’s next">
            The pulse says it happened; a mini-map would say where
          </SectionHead>
          <p className={styles.body}>
            What I have in mind is a slim strip mirroring the list in miniature:
            anchors as marks, open contexts as highlighted bands, the viewport
            as a sliding frame. When a context expands fifty lines below your
            view, the mark pulses there. And with several contexts open, the
            strip carries orientation passively — a glance, not a read. The
            pulse handles <em>this happened</em>; the mini-map handles{" "}
            <em>and here</em>.
          </p>
        </section>

        <section id="closing" tabIndex={-1} className={styles.section}>
          <SectionHead eyebrow="Closing">
            The application carries the work
          </SectionHead>
          <p className={styles.body}>
            The fan of tabs collapses. The filter persists, several
            investigations share one view, the bindings tell you what they’d do
            before you commit, and the actions you can’t see still announce
            themselves. None of it is dramatic alone — but it adds up to an
            application that holds your place so you don’t have to.
          </p>
          <p className={styles.body}>
            If one rule survives the build, it’s the one the Legend taught me:
            build the small thing, watch where it falls short, and build the
            next piece to answer that. Everything that isn’t doing work gets cut
            — even when it demos well.
          </p>
        </section>

        <StoryCta onOpenDemo={onOpenDemo} />
      </article>
    </div>
  );
}
