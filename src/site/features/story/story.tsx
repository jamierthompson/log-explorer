import { Keycap, KeycapSequence } from "@/demo";
import { Button } from "@/site/ui/button/button";
import { Eyebrow } from "@/site/ui/eyebrow/eyebrow";
import { Figure } from "@/site/ui/figure/figure";

import styles from "./story.module.css";
import { TableOfContents } from "./table-of-contents";

export function Story({ onOpenDemo }: { onOpenDemo: () => void }) {
  return (
    <div className={styles.layout}>
      <TableOfContents />
      <article className={styles.article}>
        <header className={styles.proseHead}>
          <Eyebrow>The build story</Eyebrow>
          <h1 className={styles.proseTitle}>
            A log explorer prototype for investigating an incident{" "}
            <em>without losing your place</em>.
          </h1>
          <p className={styles.proseLead}>
            A working prototype, and the story of building it. I went looking
            for a paper cut worth fixing: a small, real, unglamorous problem. I
            found a developer describing this one — losing your place in a
            live-log investigation every time you stop to look closer. The
            subject stays narrow on purpose, because the work that matters is
            small: the keyboard surface, the acknowledgement that a press
            landed, the few pixels of motion that make an action feel real.
          </p>
        </header>

        <section id="chasing-an-id" className={styles.section}>
          <h2 className={styles.heading}>Chasing an ID across tabs</h2>
          <p className={styles.body}>
            You’re troubleshooting a service incident. Logs are tailing live.
            You’ve filtered to a single request ID, the failing one, and the
            picture is finally narrowing. You click a line to see the context
            around it: the requests that came before, the calls that came after.
          </p>
          <p className={styles.body}>A new tab opens.</p>
          <p className={styles.body}>
            Your filter is gone. The live tail is gone. To see <em>more</em>,
            you click again — another tab, another cycle. By the time you’ve
            worked through the incident, you have a fan of tabs, each holding a
            slice of the story, and you’re piecing the picture back together by
            switching between them.
          </p>

          <blockquote className={styles.pullQuote}>
            <p>
              The work of narrowing in doesn’t follow you to where you look at
              it.
            </p>
          </blockquote>

          <Figure caption="A tab for every click — the investigation scatters across windows." />
        </section>

        <section id="the-idea" className={styles.section}>
          <h2 className={styles.heading}>The idea</h2>
          <p className={styles.body}>
            Open context where the line lives. Click a line — call it the anchor
            — and the rows around it expand inline, dimmed for contrast so the
            matching lines stay bright. Open a second context without losing the
            first. The filter doesn’t reset. The position doesn’t reset. The
            view stays in place; the application carries the state it should
            have been carrying all along.
          </p>

          <Figure caption="The filter persists, contexts stack — each opens in place, not in a new tab." />
        </section>

        <section id="what-i-built" className={styles.section}>
          <h2 className={styles.heading}>What I built</h2>
          <p className={styles.body}>
            A working prototype: small, focused, intentionally narrow. The
            investigation moment is the whole subject. Everything else was set
            aside to keep the focus tight.
          </p>
          <p className={styles.body}>
            The logs are mocked, not live. Filtering is three preset chips, not
            a full search system. There are no error or empty or loading states,
            and the list renders every line rather than virtualizing.
          </p>
          <p className={styles.body}>
            The mock data, though, got its own work. It tells a small story — a
            request triggers a chain of internal calls, an error surfaces, a
            recovery happens — and the filter chips correspond to specific
            moments in that story.
          </p>
        </section>

        <section id="finding-the-real-problem" className={styles.section}>
          <h2 className={styles.heading}>Finding the real problem</h2>
          <p className={styles.body}>
            My first instinct was to make the context appear with motion. Click
            an anchor, and the rows above and below grow out of it smoothly — a
            satisfying reveal, easy to picture, easy to demo.
          </p>
          <p className={styles.body}>
            I built it. At a few dozen mock lines, it looked great. At real log
            volumes, it wouldn’t have: real volumes need virtualization, and
            once rows mount and unmount as you scroll, the animation breaks.
          </p>
          <p className={styles.body}>
            That alone wouldn’t have been reason enough to cut it; plenty of
            things get reworked before they ship. The real reason was that the
            animation wasn’t doing work the prototype needed. The fan of tabs
            collapses the moment context opens in place. Smooth row reveals
            don’t close that gap any further.
          </p>
          <p className={styles.body}>
            What in-place context <em>does</em> open up is a different problem,
            layered on top of the first. With multiple contexts visible at once
            in a long list, navigation and orientation become the design work.
            And since logs are read by developers, keyboard parity with the
            mouse isn’t a nice-to-have. Both input methods need to feel
            first-class.
          </p>
          <p className={styles.body}>
            So the animation went, and the next problem came forward.
          </p>
        </section>

        <section id="the-legend" className={styles.section}>
          <h2 className={styles.heading}>The Legend</h2>
          <p className={styles.body}>
            The Legend wasn’t designed up front. It started as a single static
            hint and became the prototype’s primary interaction surface:
            adaptive, clickable, and alive to its own firings. Each piece
            arrived as the answer to a problem the last one left behind.
          </p>

          <div className={styles.figurePair}>
            <Figure caption="Day 1 — the Legend was a single static hint." />
            <Figure caption="Today — the Legend surfaces the actions that apply right now." />
          </div>

          <p className={styles.body}>
            The first design had <strong>More</strong> and <strong>Less</strong>{" "}
            buttons on each anchor — direct, discoverable, exactly what you’d
            sketch on a whiteboard. They worked until you scrolled. The anchor
            went off-screen and the buttons went with it.
          </p>
          <p className={styles.body}>
            The keyboard bindings —{" "}
            <KeycapSequence keys={["Shift", "E"]} decorative={false} /> to
            expand the most-recent context, <Keycap>Esc</Keycap> to close it —
            didn’t have that problem. They worked from the start, and they kept
            working when the anchor was out of view. With both paths available
            and one strictly worse, the buttons had to go. That left a gap for
            mouse users, but the rest of the design wasn’t settled yet, so I
            kept building.
          </p>
          <p className={styles.body}>
            The prototype also has a shortcut modal — a help dialog opened by{" "}
            <Keycap>?</Keycap> that lists every binding the app responds to. The
            modal is a reference: open it, find what you need, close it, and
            act. It tells you nothing about what would happen <em>right now</em>{" "}
            if you pressed a key.
          </p>
          <p className={styles.body}>
            A <Keycap>?</Keycap> keycap already sat in the top corner with the
            label <em>shortcuts</em> — itself a replacement for an earlier
            floating help button that read too heavy. The keycap had turned out
            well in the modal: dimensional and shaded, more like a real keyboard
            key than a flat glyph in a box. But the corner placement was still
            just a static hint.
          </p>
          <p className={styles.body}>
            The thought was small at first: turn that hint into a component that
            could <em>also</em> surface{" "}
            <KeycapSequence keys={["Shift", "E"]} decorative={false} /> and{" "}
            <Keycap>Esc</Keycap> contextually, just to see if the idea was
            useful.
          </p>
          <p className={styles.body}>
            The static hint became a small contextual toolbar.{" "}
            <KeycapSequence keys={["Shift", "E"]} decorative={false} /> appears
            when there’s a context to expand; <Keycap>Esc</Keycap> when there’s
            one to close.
          </p>
          <p className={styles.body}>It worked.</p>

          <div className={styles.twoColumn}>
            <div className={styles.twoColumnText}>
              <p>
                And the Legend’s shape — small entries arranged in a bar, each
                one labeled with a binding — turned out to also close the gap
                the cut <strong>More</strong> and <strong>Less</strong> buttons
                had left. Each entry could be a button. A click or a key press
                would trigger the same action.
              </p>
            </div>
            <Figure caption="Each entry is also a button — actions run by click, not just by key." />
          </div>

          <p className={styles.body}>
            From there the component grew. <em>View context</em> for the focused
            row. <em>Clear filter</em> when a filter is active and no contexts
            are open. The toolbar tracks the application’s state, showing only
            the bindings whose action is meaningful right now.
          </p>

          <p className={styles.body}>
            When nothing applies, it falls back to the original{" "}
            <Keycap>?</Keycap> + <em>shortcuts</em> — the surface is never
            empty.
          </p>

          <blockquote className={styles.pullQuote}>
            <p>Only show a binding when pressing it would do something.</p>
          </blockquote>

          <p className={styles.body}>
            That’s the rule. The natural question was how many entries could fit
            before the bar started to feel busy. At three it felt right; when I
            tried adding <Keycap>[</Keycap> and <Keycap>]</Keycap> for cycling
            between anchors, four felt overwhelming. Three became the cap — the{" "}
            <Keycap>[</Keycap> and <Keycap>]</Keycap> bindings stayed, listed in
            the shortcut modal rather than the Legend.
          </p>
          <p className={styles.body}>
            The bindings now had a home, the press did things, and a mouse could
            click them. But a quieter problem surfaced: if you’d scrolled away
            from the context{" "}
            <KeycapSequence keys={["Shift", "E"]} decorative={false} /> was
            expanding, the press did nothing you could see. The action fired,
            the effect happened off-screen, no acknowledgement.
          </p>
          <p className={styles.body}>
            The obvious move was to auto-scroll to where the expansion landed.
            But a context expands in two directions at once — the rows grow
            above and below the anchor — and there’s no single right place to
            scroll to. Every heuristic has a wrong answer somewhere. Yanking the
            viewport to the wrong end is worse than not scrolling at all.
          </p>
          <p className={styles.body}>
            So the acknowledgement had to live with the press itself.
          </p>

          <div className={styles.twoColumnMirrored}>
            <div className={styles.twoColumnText}>
              <p>
                Each time{" "}
                <KeycapSequence keys={["Shift", "E"]} decorative={false} />{" "}
                fires, its entry pulses — a 180ms fade, gated behind{" "}
                <code>prefers-reduced-motion</code>. The motion catches the eye
                in peripheral vision: <em>something happened</em>.
              </p>
            </div>
            <Figure caption="Acknowledgement at the press — the entry pulses when the effect lands off-screen." />
          </div>

          <p className={styles.body}>
            A keycap that started as a static hint now tells you what’s relevant
            right now, accepts a click as readily as a press, and acknowledges
            its own firings — three roles, each filling a gap the original hint
            hadn’t.
          </p>
        </section>

        <section id="what-id-do-next" className={styles.section}>
          <h2 className={styles.heading}>What I’d do next</h2>
          <p className={styles.body}>
            The pulse tells you the press landed. It doesn’t tell you where the
            effect landed.
          </p>
          <p className={styles.body}>
            What I have in mind is a mini-map — a slim strip alongside the log
            list that mirrors it in miniature. Anchor lines appear as small
            marks, open contexts as highlighted regions, the visible viewport as
            a sliding indicator. When{" "}
            <KeycapSequence keys={["Shift", "E"]} decorative={false} /> expands
            a context fifty lines below your view, the mini-map pulses at that
            position. You don’t just know an action fired — you know where it
            landed.
          </p>

          <Figure caption="An idea on paper — a mini-map to hold your place across open contexts." />

          <p className={styles.body}>
            The mini-map answers a second question alongside the first. With
            multiple contexts open across a long list, knowing where you are
            relative to where they are becomes its own small work. The mini-map
            carries that orientation passively — a glance, not a read.
          </p>
          <p className={styles.body}>
            The pulse handles <em>this happened</em>. The mini-map handles{" "}
            <em>and here</em>.
          </p>
        </section>

        <section id="what-ill-carry-forward" className={styles.section}>
          <h2 className={styles.heading}>What I’ll carry forward</h2>
          <p className={styles.body}>
            <strong>Build to discover.</strong> The Legend wasn’t designed up
            front. It was built one piece at a time, each piece answering a
            problem the previous one had left behind. Some interactions can be
            specified before they’re built. This one couldn’t.
          </p>
          <p className={styles.body}>
            <strong>Cut what isn’t doing work.</strong> The animated reveal
            looked great at a few dozen lines. It would have looked great in a
            portfolio shot. It went anyway, because it wasn’t doing the work the
            prototype needed. Polish has a finite budget; the pieces that
            survive should be the ones moving the central idea forward.
          </p>
          <p className={styles.body}>
            <strong>Acknowledge what you can’t see.</strong> When a press fires
            and the effect lands off-screen, the interface owes you something —
            small enough to register in the periphery, quiet enough not to
            demand attention. Whatever I build next, I’ll keep asking where the
            acknowledgement lives.
          </p>
          <p className={styles.body}>
            <strong>Treat keyboard and mouse as equals.</strong> Not redundant
            paths, but parallel ones. Both deserve to feel first-class — and
            when one is added later, the other shouldn’t degrade.
          </p>
        </section>

        <section id="closing" className={styles.section}>
          <h2 className={styles.heading}>Closing</h2>
          <p className={styles.body}>
            The fan of tabs collapses. The filter persists, multiple
            investigations live in one view, the bindings tell you what they’d
            do before you commit, and the actions you can’t see still announce
            themselves. None of those is dramatic alone. Together they make the
            application carry the work it should have been carrying all along.
          </p>
        </section>

        <div className={styles.storyCta}>
          <Button variant="primary" onClick={onOpenDemo}>
            Open the logs
          </Button>
        </div>
      </article>
    </div>
  );
}
