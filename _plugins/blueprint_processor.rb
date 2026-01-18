module BlueprintPreprocessor
  # Hook into Pages (standard pages) and Documents (collections/posts)
  # :pre_render ensures we catch the text BEFORE Markdown converts it (saving us from Smart Quotes issues)
  Jekyll::Hooks.register [:pages, :documents], :pre_render do |doc|
    
    # --- PART 1: IFRAMES (BlueprintUE) ---
    # Matches {bp ID}
    # Replaces it immediately with the styled HTML. Search engines strip HTML tags, so this is "invisible" to them.
    doc.content = doc.content.gsub(/\{bp\s+([^}]+)\}/) do |match|
      # Strip whitespace
      raw_id = $1.strip
      
      # Restore dashes if needed (though pre_render usually catches them raw)
      id = raw_id.gsub('–', '--').gsub('—', '---')
      
      %{
<div class="blueprint-container" style="width: 100%; height: 400px; overflow: hidden; margin: 20px auto 40px auto; border-radius: 4px;">
<iframe src="https://blueprintue.com/render/#{id}/" scrolling="no" allowfullscreen style="border: none !important; width: 104% !important; height: 104% !important; margin-left: -2% !important; margin-top: -2% !important; background: transparent !important; display: block;"></iframe>
</div>
      }
    end

    # --- PART 2: NODES (Static Pins) ---
    # Matches {bp_node_TYPE, ...}
    # We wrap the raw tag in a hidden attribute so Lunr (Search) ignores the text,
    # but our JS can still read it to render the SVG pins.
    doc.content = doc.content.gsub(/(\{bp_node_(pure|impure),[^}]+\})/) do |match|
      raw_tag = $1
      # Escape double quotes so it doesn't break the HTML attribute
      safe_tag = raw_tag.gsub('"', '&quot;')

      # Output an empty div with data attribute. Search engine sees an empty div.
      %{<div class="js-bp-node-placeholder" data-raw="#{safe_tag}" style="display:none;"></div>}
    end

  end
end