# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - img [ref=e5]
    - heading "Something went wrong" [level=2] [ref=e9]
    - paragraph [ref=e10]: can't access property "useContext", dispatcher is null
    - generic [ref=e11]:
      - button "Reload Page" [ref=e12] [cursor=pointer]
      - link "Go Home" [ref=e13] [cursor=pointer]:
        - /url: /
    - group [ref=e14]:
      - generic "Error Details" [ref=e15] [cursor=pointer]
  - generic:
    - contentinfo:
      - button "Open TanStack Router Devtools" [ref=e16] [cursor=pointer]:
        - generic [ref=e17]:
          - img [ref=e19]
          - img [ref=e55]
        - generic [ref=e90]: "-"
        - generic [ref=e91]: TanStack Router
  - generic [ref=e92]:
    - img [ref=e94]
    - button "Open Tanstack query devtools" [ref=e143] [cursor=pointer]:
      - img [ref=e144]
```